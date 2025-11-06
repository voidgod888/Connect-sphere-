import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, SkipForward, PhoneOff, Flag, HelpCircle } from 'lucide-react';

interface ControlsProps {
  onNext: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onReport: () => void;
  isMuted: boolean;
  isCameraOff: boolean;
  isNextDisabled: boolean;
}

const ControlButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
  variant?: 'primary' | 'danger' | 'warning' | 'default';
}> = ({ onClick, disabled = false, children, className = '', ariaLabel, variant = 'default' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 transform focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation';
  
  const variantClasses = {
    default: 'bg-gray-700/90 text-white hover:bg-gray-600 focus:ring-gray-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-600 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-gray-700/90 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        !disabled && !isPressed ? 'hover:scale-110 active:scale-95' : ''
      } ${isPressed ? 'scale-90' : ''} shadow-lg hover:shadow-xl`}
    >
      <div className="transition-transform duration-200">
        {children}
      </div>
    </button>
  );
};

export const Controls: React.FC<ControlsProps> = ({
  onNext,
  onStop,
  onToggleMute,
  onToggleCamera,
  onReport,
  isMuted,
  isCameraOff,
  isNextDisabled,
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <div className="relative">
      {showShortcuts && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 rounded-lg p-4 shadow-2xl border border-gray-700/50 z-50 min-w-[200px] animate-scaleIn">
          <h4 className="text-sm font-semibold text-white mb-2">Keyboard Shortcuts</h4>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex justify-between gap-4">
              <span>Mute/Unmute:</span>
              <kbd className="px-2 py-0.5 bg-gray-700 rounded">M</kbd>
            </div>
            <div className="flex justify-between gap-4">
              <span>Camera Toggle:</span>
              <kbd className="px-2 py-0.5 bg-gray-700 rounded">C</kbd>
            </div>
            <div className="flex justify-between gap-4">
              <span>Find Next:</span>
              <kbd className="px-2 py-0.5 bg-gray-700 rounded">Ctrl+Enter</kbd>
            </div>
            <div className="flex justify-between gap-4">
              <span>Stop Chat:</span>
              <kbd className="px-2 py-0.5 bg-gray-700 rounded">Esc</kbd>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 bg-black/40 backdrop-blur-md p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-700/50 shadow-2xl animate-fadeInUp overflow-x-auto">
      <ControlButton
        onClick={onToggleMute}
        ariaLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        variant={isMuted ? 'danger' : 'default'}
      >
        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
      </ControlButton>
      
      <ControlButton
        onClick={onToggleCamera}
        ariaLabel={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        variant={isCameraOff ? 'danger' : 'default'}
      >
        {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
      </ControlButton>

      <ControlButton
        onClick={onStop}
        ariaLabel="Stop chat"
        variant="danger"
      >
        <PhoneOff size={24} />
      </ControlButton>

      <ControlButton
        onClick={onNext}
        disabled={isNextDisabled}
        ariaLabel="Find next partner"
        variant="primary"
      >
        <SkipForward size={24} />
      </ControlButton>
      
      <ControlButton
        onClick={onReport}
        disabled={isNextDisabled}
        ariaLabel="Report user"
        variant="warning"
      >
        <Flag size={24} />
      </ControlButton>

      <ControlButton
        onClick={() => setShowShortcuts(!showShortcuts)}
        ariaLabel="Show keyboard shortcuts"
        variant="default"
      >
        <HelpCircle size={20} />
      </ControlButton>
    </div>
    </div>
  );
};
