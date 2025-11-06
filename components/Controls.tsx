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
    className={`group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:scale-100 shadow-lg ${className}`}
  >
    {!disabled && (
      <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    )}
    <span className="relative z-10">{children}</span>
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
    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-gray-700/30 shadow-2xl animate-fadeInUp">
      <ControlButton
        onClick={onToggleMute}
        ariaLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={isMuted ? 'bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-red-500/50' : 'bg-gray-700/80 text-white hover:bg-gray-600 focus:ring-gray-500'}
      >
        {isMuted ? <MicOff size={24} className="transform transition-transform group-hover:scale-110" /> : <Mic size={24} className="transform transition-transform group-hover:scale-110" />}
      </ControlButton>
      
      <ControlButton
        onClick={onToggleCamera}
        ariaLabel={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        className={isCameraOff ? 'bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-red-500/50' : 'bg-gray-700/80 text-white hover:bg-gray-600 focus:ring-gray-500'}
      >
        {isCameraOff ? <VideoOff size={24} className="transform transition-transform group-hover:scale-110" /> : <Video size={24} className="transform transition-transform group-hover:scale-110" />}
      </ControlButton>

      <ControlButton
        onClick={onStop}
        ariaLabel="Stop chat"
        className="bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-red-500/50"
      >
        <PhoneOff size={24} className="transform transition-transform group-hover:rotate-12" />
      </ControlButton>

      <ControlButton
        onClick={onNext}
        disabled={isNextDisabled}
        ariaLabel="Find next partner"
        className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 shadow-blue-500/50"
      >
        <SkipForward size={24} className="transform transition-transform group-hover:translate-x-1" />
      </ControlButton>
      
      <ControlButton
        onClick={onReport}
        disabled={isNextDisabled}
        ariaLabel="Report user"
        className="bg-gray-700/80 text-white hover:bg-gradient-to-br hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500 hover:shadow-yellow-500/50"
      >
        <Flag size={24} className="transform transition-transform group-hover:scale-110 group-hover:rotate-6" />
      </ControlButton>
    </div>
  );
};
