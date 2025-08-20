import React, { useState, useCallback } from 'react';
import { useAI } from '../hooks/useAI';

interface AIChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export const AIChat: React.FC = () => {
  const { generateText, isLoading, error, isAvailable } = useAI();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await generateText(userMessage.content);
      const aiMessage: AIChatMessage = {
        role: 'ai',
        content: response,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to generate AI response:', err);
    }
  }, [inputValue, isLoading, generateText]);

  if (!isAvailable) {
    return (
      <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800">
        <p>AI chat is currently unavailable. Please try again later when API keys are configured.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-12'
                : 'bg-gray-100 mr-12'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500">
            Thinking...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">
            {error.message}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className={`px-6 py-2 rounded-lg text-white ${
            isLoading || !inputValue.trim()
              ? 'bg-gray-400'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
};
