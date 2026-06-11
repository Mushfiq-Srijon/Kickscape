import React, { useState } from 'react';
import { askChatBot } from '../api';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(Date.now().toString());

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await askChatBot(userMessage, sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Error: Make sure Groq API key is set in .env' },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition transform hover:scale-110"
        style={{
          width: 'clamp(48px, 12vw, 56px)',
          height: 'clamp(48px, 12vw, 56px)',
          bottom: window.innerWidth < 480 ? '24px' : '24px',
          right: window.innerWidth < 480 ? '16px' : '24px',
          fontSize: 'clamp(20px, 5vw, 24px)',
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col" style={{
          width: 'clamp(280px, 90vw, 384px)',
          height: 'clamp(320px, 80vh, 384px)',
          maxHeight: '80vh',
          maxWidth: '90vw',
          bottom: window.innerWidth < 480 ? '80px' : '96px',
          right: window.innerWidth < 480 ? '12px' : '24px',
        }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm sm:text-base">WC Expert</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8 text-xs sm:text-sm">
                <p>🏆 Ask me anything about WC 2026!</p>
                <p className="text-xs mt-2 text-gray-500">Players, teams, stats, predictions...</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs p-3 rounded-lg text-xs sm:text-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 sm:p-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about players..."
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg disabled:opacity-50 font-semibold transition text-xs sm:text-sm"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
};