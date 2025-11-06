import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, SkipForward, PhoneOff, Flag } from 'lucide-react';

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

  const baseClasses = 'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 transform focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
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
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-gray-700/50 shadow-2xl animate-fadeInUp">
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
    </div>
  );
};
