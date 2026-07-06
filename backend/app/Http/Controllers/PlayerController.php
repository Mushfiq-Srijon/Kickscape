<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PlayerController extends Controller
{
    private string $userAgent = 'Kickscape/1.0 (https://kickscape.vercel.app) PHP/Laravel';

    // National team names to exclude from club list
    private array $nationalTeams = [
        'Argentina','Brazil','France','Germany','England','Spain','Portugal','Italy',
        'Netherlands','Belgium','Croatia','Mexico','United States','Canada','Uruguay',
        'Colombia','Ecuador','Chile','Peru','Paraguay','Bolivia','Venezuela','Jamaica',
        'Costa Rica','Panama','Honduras','Guatemala','Trinidad and Tobago','Haiti',
        'Morocco','Senegal','Nigeria','Ghana','Ivory Coast','Cameroon','Egypt','Tunisia',
        'Algeria','South Africa','Mali','Burkina Faso','Guinea','Gabon','Zimbabwe',
        'Japan','South Korea','Australia','Saudi Arabia','Iran','Qatar','Iraq','Jordan',
        'Uzbekistan','China','Indonesia','Thailand','Vietnam','India','UAE','Oman',
        'Scotland','Wales','Northern Ireland','Republic of Ireland','Turkey','Poland',
        'Switzerland','Austria','Denmark','Sweden','Norway','Finland','Czech Republic',
        'Czechia','Slovakia','Hungary','Romania','Serbia','Slovenia','Bosnia and Herzegovina',
        'Bosnia-Herzegovina','Montenegro','Albania','North Macedonia','Kosovo','Georgia',
        'Azerbaijan','Armenia','Kazakhstan','Ukraine','Russia','Belarus','Moldova',
        'New Zealand','Cape Verde Islands','Cape Verde','Curaçao','Congo DR',
    ];

    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $team  = $request->input('team', '');

        if (strlen($query) < 2) {
            if ($team) {
                $results = Player::query()
                    ->where('team', $team)
                    ->select('id', 'name', 'team', 'position', 'age', 'national_kit_number')
                    ->orderBy('name')->limit(200)->get();
                return response()->json(['total' => $results->count(), 'players' => $results]);
            }
            return response()->json(['message' => 'Search query too short', 'players' => []], 400);
        }

        $players = Player::query()->where('name', 'LIKE', "%{$query}%");
        if ($team) $players->where('team', $team);

        $results = $players
            ->select('id', 'name', 'team', 'position', 'age', 'national_kit_number')
            ->orderBy('name')->limit(200)->get();

        return response()->json(['total' => $results->count(), 'players' => $results]);
    }

    public function popular()
    {
        $popularNames = [
            'Lionel Messi','Cristiano Ronaldo','Kylian Mbappé','Neymar',
            'Kevin De Bruyne','Luka Modrić','Harry Kane','Mohamed Salah',
            'Robert Lewandowski','Antoine Griezmann','Phil Foden','Bruno Fernandes',
            'Vinicius Junior','Pedri','Jude Bellingham','Erling Haaland',
        ];

        $results = Player::query()
            ->whereIn('name', $popularNames)
            ->select('id', 'name', 'team', 'position', 'age', 'national_kit_number')
            ->orderBy('name')->limit(30)->get();

        return response()->json(['total' => $results->count(), 'players' => $results]);
    }

    // Instant — no wiki
    public function basic($id)
    {
        $player = Player::find($id);
        if (!$player) return response()->json(['message' => 'Player not found'], 404);
        return response()->json(['player' => $player]);
    }

    // Wiki only — called in background
    public function wiki($id)
    {
        $player = Player::find($id);
        if (!$player) return response()->json(['wiki' => null]);

        $wiki = Cache::remember("wiki_v2_player_{$player->id}", 172800, function () use ($player) {
            return $this->fetchWikipediaData($player->name);
        });

        return response()->json(['wiki' => $wiki]);
    }

    // Legacy — keep for backwards compat
    public function detail($id)
    {
        $player = Player::find($id);
        if (!$player) return response()->json(['message' => 'Player not found'], 404);

        $wiki = Cache::remember("wiki_v2_player_{$player->id}", 172800, function () use ($player) {
            return $this->fetchWikipediaData($player->name);
        });

        return response()->json(['player' => $player, 'wiki' => $wiki]);
    }

    public function teams()
    {
        $teams = Player::distinct()->pluck('team')->sort()->values();
        return response()->json(['teams' => $teams]);
    }

    // -----------------------------------------------------------------------
    private function http(int $timeout = 6)
    {
        return Http::timeout($timeout)->withHeaders(['User-Agent' => $this->userAgent]);
    }

    private function fetchWikipediaData(string $playerName): ?array
    {
        try {
            $encoded  = urlencode(str_replace(' ', '_', $playerName));
            $wikiResp = $this->http(6)->get(
                "https://en.wikipedia.org/api/rest_v1/page/summary/{$encoded}"
            );

            if ($wikiResp->failed() || $wikiResp->status() === 404) return null;

            $wikiData = $wikiResp->json();
            if (empty($wikiData['extract'])) return null;

            $result = [
                'title'       => $wikiData['title'] ?? $playerName,
                'extract'     => $wikiData['extract'] ?? null,
                'image'       => $wikiData['thumbnail']['source'] ?? null,
                'full_image'  => $wikiData['originalimage']['source'] ?? null,
                'wikidata_id' => $wikiData['wikibase_item'] ?? null,
                'structured'  => null,
            ];

            if (!empty($result['wikidata_id'])) {
                $result['structured'] = $this->fetchWikidataStructured($result['wikidata_id']);
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error("Wikipedia fetch failed for {$playerName}: " . $e->getMessage());
            return null;
        }
    }

    private function fetchWikidataStructured(string $wikidataId): ?array
    {
        try {
            $entityResp = $this->http(10)->get(
                "https://www.wikidata.org/wiki/Special:EntityData/{$wikidataId}.json"
            );

            if ($entityResp->failed()) return null;

            $entityData = $entityResp->json();
            $entity     = $entityData['entities'][$wikidataId] ?? null;
            if (!$entity) return null;

            $claims = $entity['claims'] ?? [];

            // Get nationality from P27 (country of citizenship)
            $nationality = $this->getWikidataLabel($claims, 'P27');

            // Get place of birth from P19
            $placeOfBirth = $this->getWikidataLabel($claims, 'P19');

            // Get height in cm from P2048
            $heightCm = $this->getWikidataValue($claims, 'P2048');

            // Get preferred foot from P741
            $foot = $this->getWikidataLabel($claims, 'P741');

            // Get ALL clubs from P54, filter out national teams
            $allClubs = $this->getWikidataAllLabels($claims, 'P54');
            $clubs    = array_values(array_filter($allClubs, function ($club) {
                return !in_array($club, $this->nationalTeams);
            }));

            // Get current club — last P54 entry that isn't a national team
            $currentClub = null;
            if (!empty($claims['P54'])) {
                $reversed = array_reverse($claims['P54']);
                foreach ($reversed as $item) {
                    $id = $item['mainsnak']['datavalue']['value']['id'] ?? null;
                    if (!$id) continue;
                    try {
                        $resp  = $this->http(4)->get("https://www.wikidata.org/wiki/Special:EntityData/{$id}.json");
                        if ($resp->failed()) continue;
                        $data  = $resp->json();
                        $label = $data['entities'][$id]['labels']['en']['value'] ?? null;
                        if ($label && !in_array($label, $this->nationalTeams)) {
                            $currentClub = $label;
                            break;
                        }
                    } catch (\Exception $e) { continue; }
                }
            }

            // International caps: P1350 (number of matches played)
            // International goals: P1351 (number of goals scored)
            // These are stored as quantities on the P54 qualifier for national team entries
            // Better to use direct properties P1350/P1351 on the entity
            $intlCaps  = $this->getWikidataQuantity($claims, 'P1350');
            $intlGoals = $this->getWikidataQuantity($claims, 'P1351');

            // If not found directly, try getting from national team membership qualifiers
            if (!$intlCaps && !empty($claims['P54'])) {
                foreach ($claims['P54'] as $item) {
                    $qualifiers = $item['qualifiers'] ?? [];
                    if (isset($qualifiers['P1350'])) {
                        $val = $qualifiers['P1350'][0]['datavalue']['value']['amount'] ?? null;
                        if ($val) { $intlCaps = abs((int) $val); break; }
                    }
                }
            }
            if (!$intlGoals && !empty($claims['P54'])) {
                foreach ($claims['P54'] as $item) {
                    $qualifiers = $item['qualifiers'] ?? [];
                    if (isset($qualifiers['P1351'])) {
                        $val = $qualifiers['P1351'][0]['datavalue']['value']['amount'] ?? null;
                        if ($val) { $intlGoals = abs((int) $val); break; }
                    }
                }
            }

            // Honours: P166 (award received) — limit to 8 most relevant
            $honours = $this->getWikidataAllLabels($claims, 'P166', 8);

            return [
                'nationality'    => $nationality,
                'place_of_birth' => $placeOfBirth,
                'height_cm'      => $heightCm,
                'foot'           => $foot,
                'current_club'   => $currentClub,
                'clubs'          => $clubs,
                'honours'        => $honours,
                'intl_caps'      => $intlCaps,
                'intl_goals'     => $intlGoals,
            ];

        } catch (\Exception $e) {
            \Log::error("Wikidata fetch failed for {$wikidataId}: " . $e->getMessage());
            return null;
        }
    }

    private function getWikidataLabel(array $claims, string $prop): ?string
    {
        if (empty($claims[$prop])) return null;
        $id = $claims[$prop][0]['mainsnak']['datavalue']['value']['id'] ?? null;
        if (!$id) return null;

        try {
            $resp = $this->http(4)->get("https://www.wikidata.org/wiki/Special:EntityData/{$id}.json");
            if ($resp->failed()) return null;
            $data = $resp->json();
            return $data['entities'][$id]['labels']['en']['value'] ?? null;
        } catch (\Exception $e) { return null; }
    }

    private function getWikidataValue(array $claims, string $prop): mixed
    {
        if (empty($claims[$prop])) return null;
        $value = $claims[$prop][0]['mainsnak']['datavalue']['value'] ?? null;
        if (is_array($value)) return $value['amount'] ?? null;
        return $value;
    }

    private function getWikidataQuantity(array $claims, string $prop): ?int
    {
        if (empty($claims[$prop])) return null;
        $value = $claims[$prop][0]['mainsnak']['datavalue']['value'] ?? null;
        if (is_array($value) && isset($value['amount'])) {
            return abs((int) $value['amount']);
        }
        return null;
    }

    private function getWikidataAllLabels(array $claims, string $prop, int $limit = 10): array
    {
        if (empty($claims[$prop])) return [];
        $labels = [];
        $items  = array_slice($claims[$prop], 0, $limit);
        foreach ($items as $item) {
            $id = $item['mainsnak']['datavalue']['value']['id'] ?? null;
            if (!$id) continue;
            try {
                $resp = $this->http(3)->get("https://www.wikidata.org/wiki/Special:EntityData/{$id}.json");
                if ($resp->failed()) continue;
                $data  = $resp->json();
                $label = $data['entities'][$id]['labels']['en']['value'] ?? null;
                if ($label) $labels[] = $label;
            } catch (\Exception $e) { continue; }
        }
        return array_unique($labels);
    }
}