
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UserSettings, ChatState, VerificationStatus, ChatMessage, AuthState, User, Partner } from './types';
import { PartnerPreference } from './types';
import { SettingsScreen } from './components/SettingsScreen';
import { ChatScreen } from './components/ChatScreen';
import { LoginScreen } from './components/LoginScreen';
import { yoloService } from './services/yoloService';
import { PARTNER_VIDEOS } from './constants';

const App: React.FC = () => {
  // Auth State
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [user, setUser] = useState<User | null>(null);

  // Chat State
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Partner & Moderation State
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [blockedPartners, setBlockedPartners] = useState<string[]>([]);
  const [reportMessage, setReportMessage] = useState<string | null>(null);

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const verificationIntervalRef = useRef<number | null>(null);
  const verificationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    yoloService.loadModel().then(() => setIsModelLoading(false));
  }, []);

  const stopMediaTracks = (stream: MediaStream | null) => {
    stream?.getTracks().forEach(track => track.stop());
  };

  const cleanupVerification = useCallback(() => {
    if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
    if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
    verificationIntervalRef.current = null;
    verificationTimeoutRef.current = null;
  }, []);
  
  const handleLogin = () => {
    // This is a simulation of a Google Sign-In
    setUser({ id: `user_${Date.now()}`, name: 'Demo User', email: 'demo.user@example.com' });
    setAuthState('authenticated');
  };

  const handleLogout = useCallback(() => {
    if (chatState !== 'idle') {
      // Use a function form of stopChat if it's not already wrapped in useCallback
      stopChat(true); // Pass a flag to indicate logout
    }
    setUser(null);
    setAuthState('unauthenticated');
    setBlockedPartners([]); // Clear block list on logout
  }, [chatState]);


  const selectNextPartner = useCallback(() => {
    const availablePartners = PARTNER_VIDEOS.filter(
      url => !blockedPartners.includes(url) && url !== currentPartner?.id
    );

    if (availablePartners.length > 0) {
      const randomUrl = availablePartners[Math.floor(Math.random() * availablePartners.length)];
      return { id: randomUrl, videoUrl: randomUrl };
    }
    
    // Fallback if all partners are blocked or only one is left
    const fallbackPartners = PARTNER_VIDEOS.filter(url => url !== currentPartner?.id);
    if (fallbackPartners.length > 0) {
       const randomUrl = fallbackPartners[Math.floor(Math.random() * fallbackPartners.length)];
       return { id: randomUrl, videoUrl: randomUrl };
    }
    
    return null; // No partners available at all
  }, [blockedPartners, currentPartner]);


  const findNext = useCallback(() => {
    cleanupVerification();
    setVerificationStatus('idle');
    setChatState('searching');
    setRemoteStream(null);
    setMessages([]);
    setCurrentPartner(null);

    const nextPartner = selectNextPartner();
    if (!nextPartner) {
      setError("No available partners to connect with at this time. Please try again later.");
      setChatState('idle');
      return;
    }

    setTimeout(() => {
      setCurrentPartner(nextPartner);
      setChatState('connected');
    }, 2000);
  }, [cleanupVerification, selectNextPartner]);


  useEffect(() => {
    if (chatState === 'connected' && currentPartner && partnerVideoElementRef.current) {
      const videoEl = partnerVideoElementRef.current;
      videoEl.src = currentPartner.videoUrl;
      const playPromise = videoEl.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          let stream;
          if (videoEl.captureStream) {
            stream = videoEl.captureStream();
          } else if ((videoEl as any).mozCaptureStream) { // Firefox support
            stream = (videoEl as any).mozCaptureStream();
          } else {
            console.error("captureStream API is not supported.");
            setError("Could not establish video stream with partner.");
            return;
          }
          setRemoteStream(stream);
        }).catch(error => {
          console.error("Error playing partner video:", error);
          setError("Could not play partner video due to browser restrictions. Please ensure autoplay is enabled.");
        });
      }
    }
  }, [chatState, currentPartner]);

  const startChat = useCallback(async (newSettings: UserSettings) => {
    setSettings(newSettings);
    setChatState('requesting_permissions');
    setError(null);

    if (isModelLoading) {
      setError('The recognition model is still loading. Please wait a moment.');
      setChatState('idle');
      return;
    }
    
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setError('Media devices require a secure (HTTPS) connection and are not supported in this browser.');
      setChatState('idle');
      return;
    }

    try {
      // --- OPTIMIZATION: Request higher quality video ---
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: 'user'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      findNext();
    } catch (err) {
      console.error('Error accessing media devices.', err);
      let message = `Could not access camera/microphone. Please check your browser permissions.`;
      if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') message = 'Camera and microphone access was denied. Please enable it in your browser settings.';
          else if (err.name === 'NotFoundError') message = 'No camera or microphone was found.';
          else if (err.name === 'OverconstrainedError') message = 'Your camera does not support the requested HD resolution. The application will not be able to start.';
      }
      setError(message);
      setChatState('idle');
    }
  }, [isModelLoading, findNext]);
  
  const stopChat = useCallback((isLoggingOut = false) => {
    setChatState('idle');
    stopMediaTracks(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    if (!isLoggingOut) setSettings(null);
    cleanupVerification();
    setVerificationStatus('idle');
    setMessages([]);
    setCurrentPartner(null);
    if (partnerVideoElementRef.current) {
        partnerVideoElementRef.current.pause();
        partnerVideoElementRef.current.src = '';
    }
  }, [cleanupVerification]);

  const handleReport = () => {
    if (!currentPartner) return;
    setBlockedPartners(prev => [...new Set([...prev, currentPartner.id])]); // Avoid duplicates
    setReportMessage('Partner has been reported and blocked for this session.');
    setTimeout(() => setReportMessage(null), 3500);
    findNext();
  };
  
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const replies = ["That's interesting!", "Cool.", "I see.", "Tell me more.", "Haha, nice!", "Really? Wow."];
      const partnerMessage: ChatMessage = {
        id: `partner-${Date.now()}`,
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'partner',
      };
      setMessages(prev => [...prev, partnerMessage]);
    }, 1500 + Math.random() * 1000);
  };
  
  useEffect(() => {
    if (chatState === 'connected' && remoteStream && settings?.preference !== PartnerPreference.Everyone) {
      setVerificationStatus('verifying');
      
      verificationTimeoutRef.current = window.setTimeout(() => {
        cleanupVerification();
        setVerificationStatus('verified');
      }, 10000);

      verificationIntervalRef.current = window.setInterval(async () => {
        if (remoteVideoRef.current && remoteVideoRef.current.readyState >= 3) {
          const detectedGender = await yoloService.detectGender(remoteVideoRef.current);
          if (detectedGender) {
            cleanupVerification();
            if (detectedGender === settings.preference) {
              setVerificationStatus('verified');
            } else {
              setVerificationStatus('mismatch');
              setTimeout(() => findNext(), 1500);
            }
          }
        }
      }, 1000);
    } else if (chatState === 'connected') {
        setVerificationStatus('verified');
    }

    return cleanupVerification;
  }, [chatState, remoteStream, settings, findNext, cleanupVerification]);

  useEffect(() => {
    return () => {
      stopMediaTracks(localStreamRef.current);
      cleanupVerification();
    };
  }, [cleanupVerification]);

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 flex flex-col font-sans">
      {/* Hidden video element to generate partner streams */}
      <video ref={partnerVideoElementRef} style={{ display: 'none' }} crossOrigin="anonymous" playsInline loop muted />
      
      {authState === 'unauthenticated' ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
          <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm z-20">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white tracking-wider">
                Connect<span className="text-blue-400">Sphere</span>
              </h1>
              {chatState !== 'idle' ? (
                 <button
                  onClick={() => stopChat(false)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Stop
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">Welcome, {user?.name}!</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            {chatState === 'idle' ? (
              <SettingsScreen onStart={startChat} error={error} />
            ) : (
              <ChatScreen
                chatState={chatState}
                localStream={localStream}
                remoteStream={remoteStream}
                remoteVideoRef={remoteVideoRef}
                verificationStatus={verificationStatus}
                messages={messages}
                reportMessage={reportMessage}
                onNext={findNext}
                onStop={() => stopChat(false)}
                onSendMessage={handleSendMessage}
                onReport={handleReport}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
