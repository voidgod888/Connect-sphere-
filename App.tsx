
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UserSettings, ChatState, VerificationStatus, ChatMessage, AuthState, User, Partner } from './types';
import { PartnerPreference } from './types';
import { SettingsScreen } from './components/SettingsScreen';
import { ChatScreen } from './components/ChatScreen';
import { LoginScreen } from './components/LoginScreen';
import { yoloService } from './services/yoloService';
import { apiService } from './services/apiService';
import { socketService } from './services/socketService';
import { WebRTCService } from './services/webrtcService';

const App: React.FC = () => {
  // Auth State
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
  const [reportMessage, setReportMessage] = useState<string | null>(null);

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const verificationIntervalRef = useRef<number | null>(null);
  const verificationTimeoutRef = useRef<number | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiService.getCurrentUser();
        if (response && response.user) {
          setUser(response.user);
          setAuthState('authenticated');
          // Connect to socket after authentication
          await socketService.connect();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
    yoloService.loadModel().then(() => setIsModelLoading(false));
  }, []);

  // Setup socket listeners when authenticated
  useEffect(() => {
    if (authState !== 'authenticated' || !socketService.isConnected()) return;

    // Partner found
    socketService.onPartnerFound(async ({ partnerId, partnerName }) => {
      console.log('Partner found:', partnerName);
      setCurrentPartner({ id: partnerId, videoUrl: '' }); // videoUrl not needed for real WebRTC
      setChatState('connected');
      setMessages([]);

      // Initialize WebRTC
      if (localStreamRef.current) {
        webrtcServiceRef.current = new WebRTCService();
        await webrtcServiceRef.current.initialize(localStreamRef.current, partnerId);
        
        webrtcServiceRef.current.onRemoteStream((stream) => {
          setRemoteStream(stream);
        });

        webrtcServiceRef.current.onConnectionStateChange((state) => {
          console.log('WebRTC connection state:', state);
          if (state === 'failed' || state === 'disconnected') {
            setError('Connection to partner lost');
          }
        });

        // Create offer to start WebRTC connection
        await webrtcServiceRef.current.createOffer();
      }
    });

    // Searching for partner
    socketService.onSearching(() => {
      setChatState('searching');
    });

    // Receive chat message
    socketService.onChatMessage((message) => {
      const chatMessage: ChatMessage = {
        id: message.id,
        text: message.text,
        sender: 'partner',
      };
      setMessages(prev => [...prev, chatMessage]);
    });

    // Partner disconnected
    socketService.onPartnerDisconnected(() => {
      handlePartnerDisconnected();
    });

    // Socket errors
    socketService.onError((error) => {
      setError(error.message);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [authState]);

  const handlePartnerDisconnected = useCallback(() => {
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.close();
      webrtcServiceRef.current = null;
    }
    setRemoteStream(null);
    setCurrentPartner(null);
    setChatState('disconnected');
    setMessages([]);
    
    // Show message briefly then return to idle
    setTimeout(() => {
      setChatState('idle');
    }, 2000);
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
    // This will be handled by OAuth redirect
    // Placeholder for the component
  };

  const handleLogout = useCallback(async () => {
    if (chatState !== 'idle') {
      await stopChat();
    }
    
    await apiService.logout();
    socketService.disconnect();
    
    setUser(null);
    setAuthState('unauthenticated');
    setSettings(null);
  }, [chatState, stopChat]);

  const findNext = useCallback(() => {
    if (!settings) return;

    cleanupVerification();
    setVerificationStatus('idle');
    setChatState('searching');
    setRemoteStream(null);
    setMessages([]);
    setCurrentPartner(null);

    // Close existing WebRTC connection
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.close();
      webrtcServiceRef.current = null;
    }

    // Disconnect from current partner and find new one
    socketService.disconnectPartner();
    socketService.findPartner(settings);
  }, [cleanupVerification, settings]);

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
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: 'user'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints, 
        audio: true 
      });
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      // Find partner via socket
      socketService.findPartner(newSettings);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      let message = `Could not access camera/microphone. Please check your browser permissions.`;
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          message = 'Camera and microphone access was denied. Please enable it in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          message = 'No camera or microphone was found.';
        } else if (err.name === 'OverconstrainedError') {
          message = 'Your camera does not support the requested HD resolution. The application will not be able to start.';
        }
      }
      setError(message);
      setChatState('idle');
    }
  }, [isModelLoading]);
  
  const stopChat = useCallback(async () => {
    setChatState('idle');
    stopMediaTracks(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setSettings(null);
    cleanupVerification();
    setVerificationStatus('idle');
    setMessages([]);
    setCurrentPartner(null);
    
    // Close WebRTC connection
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.close();
      webrtcServiceRef.current = null;
    }
    
    // Disconnect from socket partner
    socketService.disconnectPartner();
  }, [cleanupVerification]);

  const handleReport = () => {
    if (!currentPartner) return;
    
    socketService.reportUser(currentPartner.id);
    setReportMessage('Partner has been reported and blocked.');
    setTimeout(() => setReportMessage(null), 3500);
    
    // The backend will disconnect the users
  };
  
  const handleSendMessage = (text: string) => {
    if (!text.trim() || !currentPartner) return;

    const userMessage: ChatMessage = { 
      id: `user-${Date.now()}`, 
      text, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMessage]);

    // Send via socket to backend
    socketService.sendChatMessage(text, currentPartner.id);
  };
  
  // Gender verification for remote stream
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
      socketService.disconnect();
    };
  }, [cleanupVerification]);

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 flex flex-col font-sans">
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
                  onClick={stopChat}
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
                onStop={stopChat}
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
