import React from 'react';
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
}> = ({ onClick, disabled = false, children, className = '', ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
  >
    {children}
  </button>
);

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
  // Fix: Removed unused `isChatActive` variable that was causing reference errors
  // because `chatState` and `verificationStatus` are not props of this component.
  // The `isNextDisabled` prop is used for disabling controls.

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-black/30 backdrop-blur-sm p-2 rounded-full">
      <ControlButton
        onClick={onToggleMute}
        ariaLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={isMuted ? 'bg-red-600 text-white focus:ring-red-500' : 'bg-gray-700/80 text-white hover:bg-gray-600 focus:ring-gray-500'}
      >
        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
      </ControlButton>
      
      <ControlButton
        onClick={onToggleCamera}
        ariaLabel={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        className={isCameraOff ? 'bg-red-600 text-white focus:ring-red-500' : 'bg-gray-700/80 text-white hover:bg-gray-600 focus:ring-gray-500'}
      >
        {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
      </ControlButton>

      <ControlButton
        onClick={onStop}
        ariaLabel="Stop chat"
        className="bg-red-600 text-white focus:ring-red-500"
      >
        <PhoneOff size={24} />
      </ControlButton>

      <ControlButton
        onClick={onNext}
        disabled={isNextDisabled}
        ariaLabel="Find next partner"
        className="bg-blue-600 text-white focus:ring-blue-500"
      >
        <SkipForward size={24} />
      </ControlButton>
       <ControlButton
        onClick={onReport}
        disabled={isNextDisabled}
        ariaLabel="Report user"
        className="bg-gray-700/80 text-white hover:bg-yellow-600 focus:ring-yellow-500"
      >
        <Flag size={24} />
      </ControlButton>
    </div>
  );
};
