import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isPartnerTyping?: boolean;
}

const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch {
    return '';
  }
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isPartnerTyping = false }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].id !== lastMessageId) {
      setLastMessageId(messages[messages.length - 1].id);
    }
  }, [messages, lastMessageId]);

  return (
    <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gradient-to-b from-gray-800/50 to-gray-900/50">
      <div className="flex flex-col gap-2 sm:gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 animate-fadeIn">
            <div className="text-center px-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-xs sm:text-sm">No messages yet. Start the conversation!</p>
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
                  className={`max-w-[75%] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-white shadow-lg transition-all duration-300 ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 rounded-br-sm' 
                      : 'bg-gray-700 rounded-bl-sm'
                  } ${isNewMessage ? 'animate-scaleIn' : ''}`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  {msg.timestamp && (
                    <p className={`text-[10px] sm:text-xs mt-1 opacity-70 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isPartnerTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-gray-700 rounded-2xl rounded-bl-sm px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};
