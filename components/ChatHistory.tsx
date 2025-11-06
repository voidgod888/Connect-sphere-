import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].id !== lastMessageId) {
      setLastMessageId(messages[messages.length - 1].id);
    }
  }, [messages, lastMessageId]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-800/50 to-gray-900/50">
      <div className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 animate-fadeIn">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isNewMessage = msg.id === lastMessageId && index === messages.length - 1;
            return (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideInRight`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'backwards',
                }}
              >
                <div
                  className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 rounded-br-sm' 
                      : 'bg-gray-700 rounded-bl-sm'
                  } ${isNewMessage ? 'animate-scaleIn' : ''}`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};
