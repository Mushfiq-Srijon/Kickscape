import React, { useState } from 'react';
import axios from 'axios';

export const Chatbot = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(Date.now().toString());

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages([...messages, { role: 'user', content: input }]);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        query: input,
        session_id: sessionId
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    }

    setInput('');
    setLoading(false);
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l shadow-lg p-4 flex flex-col">
      <h2 className="font-bold text-lg mb-4">WC Assistant 🤖</h2>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block p-3 rounded-lg max-w-xs ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about players..."
          className="flex-1 border p-2 rounded"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};