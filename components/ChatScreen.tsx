
import React, { useState } from 'react';
import type { ChatState, VerificationStatus, ChatMessage } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { Controls } from './Controls';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';


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

  const icons = {
    verifying: <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>,
    mismatch: <XCircle className="w-16 h-16 text-red-400 mb-4 animate-scaleIn" />,
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fadeIn">
      {icons[status]}
      <p className="text-xl text-gray-200 font-medium animate-fadeInUp">{messages[status]}</p>
      {status === 'verifying' && (
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  );
};

const ReportMessageOverlay: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-scaleIn">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md mx-4 animate-scaleIn shadow-2xl border border-green-500/50">
        <ShieldCheck className="w-16 h-16 text-green-400 mb-4 mx-auto animate-scaleIn" />
        <p className="text-xl text-center text-gray-200 font-medium">{message}</p>
      </div>
    </div>
  );
};

const SearchingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-900/20 to-black flex flex-col items-center justify-center z-10 animate-fadeIn">
    <div className="relative">
      <div className="animate-spin-slow rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-400 mb-6"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full animate-pulse-slow"></div>
      </div>
    </div>
    <p className="mt-4 text-2xl text-gray-300 font-medium animate-fadeInUp">Searching for a partner...</p>
    <div className="mt-6 flex gap-2">
      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
    </div>
  </div>
);

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
  chatState, 
  localStream, 
  remoteStream, 
  remoteVideoRef, 
  verificationStatus, 
  messages, 
  reportMessage, 
  onNext, 
  onStop, 
  onSendMessage, 
  onReport 
}) => {
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
    <div className="w-full h-full flex flex-col md:flex-row bg-black animate-fadeIn">
      {/* Video Area */}
      <div className="relative flex-1 h-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="w-full h-full flex items-center justify-center relative animate-fadeIn">
          <VideoPlayer 
            stream={remoteStream} 
            muted={false} 
            playerRef={remoteVideoRef} 
            showVolumeControl 
          />
          
          {chatState === 'searching' && <SearchingOverlay />}
          <VerificationOverlay status={verificationStatus} />
          <ReportMessageOverlay message={reportMessage} />
          
          {/* Connection status indicator */}
          {chatState === 'connected' && verificationStatus === 'verified' && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-green-500/50 animate-fadeInDown z-20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-300 font-medium">Connected</span>
            </div>
          )}
        </div>

        {/* Local video preview */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-36 h-auto sm:w-48 md:w-64 z-20 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700/50 backdrop-blur-sm animate-scaleIn hover:border-blue-500/50 transition-all duration-300">
          <VideoPlayer stream={localStream} muted={true} isCameraOff={isCameraOff}/>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 animate-fadeInUp">
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
      <div className="w-full h-[40vh] md:h-full md:w-80 lg:w-96 bg-gray-800/95 backdrop-blur-md flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-gray-700/50 animate-slideInRight shadow-2xl">
        <div className="p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-center text-white flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </h3>
        </div>
        <ChatHistory messages={messages} />
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
