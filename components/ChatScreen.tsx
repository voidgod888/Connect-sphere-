
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
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-10 transition-opacity duration-300">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400 mb-4"></div>
      <p className="text-xl text-gray-200">{messages[status]}</p>
    </div>
  );
};

const ReportMessageOverlay: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-30 transition-opacity duration-300">
      <ShieldCheck className="w-16 h-16 text-green-400 mb-4" />
      <p className="text-xl text-center text-gray-200 px-4">{message}</p>
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
    <div className="w-full h-full flex flex-col md:flex-row bg-black">
      {/* Video Area */}
      <div className="relative flex-1 h-full flex flex-col items-center justify-center bg-black">
        <div className="w-full h-full flex items-center justify-center">
          <VideoPlayer stream={remoteStream} muted={false} playerRef={remoteVideoRef} showVolumeControl />
          {chatState === 'searching' && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-10">
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
              <p className="mt-4 text-xl text-gray-300">Searching for a partner...</p>
            </div>
          )}
          <VerificationOverlay status={verificationStatus} />
          <ReportMessageOverlay message={reportMessage} />
        </div>

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-36 h-auto sm:w-48 md:w-64 z-20 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
          <VideoPlayer stream={localStream} muted={true} isCameraOff={isCameraOff}/>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
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
      <div className="w-full h-[40vh] md:h-full md:w-80 lg:w-96 bg-gray-800 flex flex-col border-t-2 md:border-t-0 md:border-l-2 border-gray-700">
        <div className="p-4 border-b border-gray-700 bg-gray-900/50">
          <h3 className="text-lg font-semibold text-center text-white">Chat</h3>
        </div>
        <ChatHistory messages={messages} />
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
