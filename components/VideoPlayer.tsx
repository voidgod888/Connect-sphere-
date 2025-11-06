import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { isMobileDevice } from '../utils';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted: boolean;
  isCameraOff?: boolean;
  playerRef?: React.RefObject<HTMLVideoElement>;
  showVolumeControl?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted, isCameraOff = false, playerRef, showVolumeControl = false }) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = playerRef || internalRef;
  const [volume, setVolume] = useState(1);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Add fade-in animation when stream starts
      videoRef.current.classList.add('animate-fadeIn');
    }
  }, [stream, videoRef]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isVolumeMuted ? 0 : volume;
    }
  }, [volume, isVolumeMuted, videoRef]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isVolumeMuted) {
      setIsVolumeMuted(false);
    }
  };

  const toggleVolumeMute = () => {
    setIsVolumeMuted(prev => !prev);
  };

  const getVolumeIcon = () => {
    if (isVolumeMuted || volume === 0) return <VolumeX size={20} className="w-5 h-5 transition-transform duration-200 hover:scale-110"/>;
    if (volume < 0.5) return <Volume1 size={20} className="w-5 h-5 transition-transform duration-200 hover:scale-110"/>;
    return <Volume2 size={20} className="w-5 h-5 transition-transform duration-200 hover:scale-110"/>;
  }

  const isMobile = isMobileDevice();

  return (
    <div 
      className="group w-full h-full bg-black flex items-center justify-center relative overflow-hidden animate-fadeIn"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={() => isMobile && setIsHovered(true)}
      onTouchEnd={() => {
        if (isMobile) {
          setTimeout(() => setIsHovered(false), 3000);
        }
      }}
    >
       {isCameraOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 animate-fadeIn">
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-500 mx-auto animate-pulse"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <p className="text-gray-500 mt-2 text-sm">Camera Off</p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
       {showVolumeControl && !isCameraOff && stream && (
        <div 
          className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-56 max-w-xs bg-gray-900/80 backdrop-blur-md rounded-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3 shadow-xl border border-gray-700/50 transition-all duration-300 z-30 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button 
            onClick={toggleVolumeMute} 
            className="text-white hover:text-blue-400 transition-all duration-200 transform active:scale-95 pl-1 sm:pl-2 touch-manipulation flex-shrink-0"
          >
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isVolumeMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all touch-manipulation"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isVolumeMuted ? 0 : volume) * 100}%, #374151 ${(isVolumeMuted ? 0 : volume) * 100}%, #374151 100%)`
            }}
            aria-label="Volume"
          />
          <span className="text-white text-xs font-medium w-6 sm:w-8 text-right flex-shrink-0">
            {Math.round((isVolumeMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
