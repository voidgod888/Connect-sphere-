import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-800/50 to-transparent">
      <div className="flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-fadeIn">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Start chatting with your partner...</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div
              className={`group max-w-xs md:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-white transition-all duration-300 transform hover:scale-105 ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 rounded-br-lg shadow-lg shadow-blue-500/50' 
                  : 'bg-gray-700/80 backdrop-blur-sm rounded-bl-lg shadow-lg hover:bg-gray-700'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};
