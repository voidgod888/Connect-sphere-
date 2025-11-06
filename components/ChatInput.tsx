import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  matchId?: string | null;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onTyping, matchId }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!matchId || !onTyping) return;
    
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
      onTyping(false);
    }, 3000);
  }, [matchId, onTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    handleTyping();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (isTypingRef.current && onTyping) {
        isTypingRef.current = false;
        onTyping(false);
      }
    }
  };

  useEffect(() => {
    // Auto-focus input when component mounts
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 animate-fadeInUp">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type a message..."
            className={`w-full bg-gray-700/80 text-white placeholder-gray-400 rounded-full py-3 pl-5 pr-14 focus:outline-none transition-all duration-300 ${
              isFocused 
                ? 'ring-2 ring-blue-500 bg-gray-700 shadow-lg shadow-blue-500/20 scale-[1.02]' 
                : 'focus:ring-2 focus:ring-blue-500'
            }`}
            aria-label="Chat message input"
          />
          {isFocused && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 pointer-events-none animate-pulse-slow"></div>
          )}
        </div>
        <button
          type="submit"
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 transform ${
            text.trim()
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/50 hover:scale-110 active:scale-95'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
          }`}
          disabled={!text.trim()}
          aria-label="Send message"
        >
          {text.trim() ? (
            <Send size={20} className="transition-transform duration-200" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};
