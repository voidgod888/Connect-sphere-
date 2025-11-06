import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  matchId?: string | null;
}

const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '💯', '🎉', '✨', '👋', '🙏', '😊', '😢', '😮', '😴', '🤗', '😋'];

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onTyping, matchId }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingTimeRef = useRef<number>(0);

  const handleTyping = useCallback(() => {
    if (!onTyping || !matchId) return;
    
    const now = Date.now();
    if (now - lastTypingTimeRef.current > 1000) {
      onTyping(true);
      lastTypingTimeRef.current = now;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      onTyping(false);
    }, 2000);
  }, [onTyping, matchId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    handleTyping();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
      if (onTyping) {
        onTyping(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setText(newText);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
      handleTyping();
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
    <div className="p-3 sm:p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 animate-fadeInUp safe-area-inset-bottom">
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 bg-gray-800 rounded-xl p-3 shadow-2xl border border-gray-700/50 z-50 animate-scaleIn">
          <div className="grid grid-cols-5 gap-2 max-w-xs">
            {EMOJI_LIST.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => {
                  insertEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-125"
                aria-label={`Insert ${emoji} emoji`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-gray-700/80 text-gray-300 hover:bg-gray-600 transition-all duration-200 hover:scale-110 touch-manipulation"
          aria-label="Open emoji picker"
        >
          <Smile size={20} />
        </button>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowEmojiPicker(false), 200);
            }}
            placeholder="Type a message..."
            maxLength={500}
            className={`w-full bg-gray-700/80 text-white placeholder-gray-400 rounded-full py-2.5 sm:py-3 pl-4 sm:pl-5 pr-12 sm:pr-14 text-sm sm:text-base focus:outline-none transition-all duration-300 ${
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
          className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-all duration-300 transform touch-manipulation ${
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
      {text.length > 400 && (
        <p className="text-xs text-yellow-400 mt-1 ml-2">
          {text.length}/500 characters
        </p>
      )}
    </div>
  );
};
