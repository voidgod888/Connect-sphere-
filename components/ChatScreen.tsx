
import React, { useState } from 'react';
import type { ChatState, VerificationStatus, ChatMessage } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { Controls } from './Controls';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { ShieldCheck } from 'lucide-react';


interface ChatScreenProps {
  chatState: ChatState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  verificationStatus: VerificationStatus;
  messages: ChatMessage[];
  reportMessage: string | null;
  onNext: () => void;
  onStop: () => void;
  onSendMessage: (text: string) => void;
  onReport: () => void;
}

const VerificationOverlay: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'idle' || status === 'verified') return null;

  const messages = {
    verifying: 'Verifying partner...',
    mismatch: 'Gender mismatch. Finding next partner...',
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-500 animate-fadeIn">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-400 border-r-blue-400"></div>
        <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-xl text-gray-200 font-medium animate-pulse">{messages[status]}</p>
      {status === 'verifying' && (
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  );
};

const ReportMessageOverlay: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 transition-all duration-500 animate-scaleIn">
      <div className="animate-bounce mb-6">
        <ShieldCheck className="w-20 h-20 text-green-400 drop-shadow-2xl" />
      </div>
      <p className="text-xl text-center text-gray-200 px-4 font-medium animate-fadeInUp">{message}</p>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-green-400/50 rounded-full overflow-hidden">
        <div className="h-full bg-green-400 animate-shimmer"></div>
      </div>
    </div>
  );
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ chatState, localStream, remoteStream, remoteVideoRef, verificationStatus, messages, reportMessage, onNext, onStop, onSendMessage, onReport }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
     if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(prev => !prev);
    }
  };
  
  const isNextDisabled = chatState === 'searching' || (verificationStatus !== 'verified' && verificationStatus !== 'idle');

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-black relative">
      {/* Video Area */}
      <div className="relative flex-1 h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black animate-fadeIn">
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent"></div>
          <VideoPlayer stream={remoteStream} muted={false} playerRef={remoteVideoRef} showVolumeControl />
          {chatState === 'searching' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fadeIn">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500/30 border-t-blue-400 border-r-blue-400"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-purple-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-2 animate-ping rounded-full border-2 border-blue-400/50"></div>
              </div>
              <p className="mt-4 text-2xl text-gray-200 font-medium animate-pulse">Searching for a partner...</p>
              <div className="mt-6 flex gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <VerificationOverlay status={verificationStatus} />
          <ReportMessageOverlay message={reportMessage} />
        </div>

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-36 h-auto sm:w-48 md:w-64 z-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700/50 backdrop-blur-sm bg-black/20 animate-slideInLeft transform hover:scale-105 transition-transform duration-300">
          <VideoPlayer stream={localStream} muted={true} isCameraOff={isCameraOff}/>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 animate-fadeInUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <Controls
            onNext={onNext}
            onStop={onStop}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onReport={onReport}
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isNextDisabled={isNextDisabled}
          />
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-full h-[40vh] md:h-full md:w-80 lg:w-96 bg-gray-800/95 backdrop-blur-md flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-gray-700/50 shadow-2xl animate-slideInRight">
        <div className="p-4 border-b border-gray-700/50 bg-indigo-900/30">
          <h3 className="text-lg font-semibold text-center text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Chat
          </h3>
        </div>
        <ChatHistory messages={messages} />
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
