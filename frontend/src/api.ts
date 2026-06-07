import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getMatches = (timezone: string) =>
    api.get('/matches', { params: { timezone } });

export const getTeamStandings = (group?: string) =>
    api.get('/teams/standings', { params: { group } });

export const searchPlayers = (q: string, team?: string) =>
    api.get('/players/search', { params: { q, team } });

export const askChatBot = (query: string, sessionId: string) =>
    api.post('/chat', { query, session_id: sessionId });