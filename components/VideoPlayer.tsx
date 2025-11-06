import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

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

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    if (videoRef.current) {
      // Don't control the `muted` attribute here, as it's handled by the parent
      // for autoplay and local stream echo cancellation.
      // Instead, control volume directly.
      videoRef.current.volume = isVolumeMuted ? 0 : volume;
    }
  }, [volume, isVolumeMuted, videoRef, stream]);


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
    if (isVolumeMuted || volume === 0) return <VolumeX size={20} className="w-5 h-5"/>;
    if (volume < 0.5) return <Volume1 size={20} className="w-5 h-5"/>;
    return <Volume2 size={20} className="w-5 h-5"/>;
  }

  return (
    <div className="group w-full h-full bg-black flex items-center justify-center relative">
       {isCameraOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      )}
       {showVolumeControl && !isCameraOff && stream && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 bg-gray-900/50 backdrop-blur-sm rounded-full p-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <button onClick={toggleVolumeMute} className="text-white hover:text-blue-400 transition-colors pl-2">
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isVolumeMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Volume"
          />
        </div>
      )}
    </div>
  );
};