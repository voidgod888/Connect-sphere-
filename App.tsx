
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UserSettings, ChatState, VerificationStatus, ChatMessage, Partner } from './types';
import { PartnerPreference } from './types';
import { SettingsScreen } from './components/SettingsScreen';
import { ChatScreen } from './components/ChatScreen';
import { ToastContainer, Toast, ToastType } from './components/Toast';
import { yoloService } from './services/yoloService';
import { apiService } from './services/api';
import { socketService } from './services/socketService';
import { PARTNER_VIDEOS } from './constants';

const App: React.FC = () => {
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
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [blockedPartners, setBlockedPartners] = useState<string[]>([]);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const verificationIntervalRef = useRef<number | null>(null);
  const verificationTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    yoloService.loadModel().then(() => {
      setIsModelLoading(false);
      showToast('Ready to chat!', 'success');
    });
  }, [showToast]);

  const stopMediaTracks = (stream: MediaStream | null) => {
    stream?.getTracks().forEach(track => track.stop());
  };

  const cleanupVerification = useCallback(() => {
    if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
    if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
    verificationIntervalRef.current = null;
    verificationTimeoutRef.current = null;
  }, []);
  
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
    setCurrentMatchId(null);
    
    // Leave queue and end match if exists
    socketService.leaveQueue();
    if (currentMatchId) {
      socketService.endMatch(currentMatchId);
    }
    
    if (partnerVideoElementRef.current) {
        partnerVideoElementRef.current.pause();
        partnerVideoElementRef.current.src = '';
    }
  }, [cleanupVerification, currentMatchId]);

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
    if (!isSocketConnected || !settings) {
      setError("Not connected to server. Please try again.");
      return;
    }

    cleanupVerification();
    setVerificationStatus('idle');
    setChatState('searching');
    setRemoteStream(null);
    setMessages([]);
    setCurrentPartner(null);
    setCurrentMatchId(null);

    // Leave previous queue and join new one
    socketService.leaveQueue();
    socketService.joinQueue(
      settings.preference,
      { identity: settings.identity, country: settings.country },
      (response) => {
        if (response.error) {
          setError(response.error);
          setChatState('idle');
          showToast(response.error, 'error');
        } else if (response.matched) {
          // Match found - will be handled by socket event
          showToast('Match found!', 'success');
        } else {
          // Still waiting for match
          console.log('Waiting for match...', response);
          showToast('Searching for a partner...', 'info', 2000);
        }
      }
    );
  }, [cleanupVerification, isSocketConnected, user, settings, showToast]);


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
      // Connect to socket if not already connected
      if (!isSocketConnected) {
        try {
          await socketService.connect();
          setIsSocketConnected(true);
        } catch (socketError) {
          console.error('Socket connection error:', socketError);
          const errorMsg = 'Failed to connect to server. Please check your connection and try again.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
          setChatState('idle');
          return;
        }
      }
      
      // --- MOBILE DETECTION AND OPTIMIZATION ---
      const detectMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                                 (window.innerWidth <= 768) ||
                                 ('ontouchstart' in window);
      const isMobile = detectMobile();
      
      // Mobile-friendly video constraints
      const videoConstraints: MediaTrackConstraints = isMobile ? {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 24, max: 30 },
        facingMode: 'user'
      } : {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: 'user'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      findNext();
    } catch (err) {
      console.error('Error accessing media devices.', err);
      let message = `Could not access camera/microphone. Please check your browser permissions.`;
      if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            message = 'Camera and microphone access was denied. Please enable it in your browser settings and refresh the page.';
          } else if (err.name === 'NotFoundError') {
            message = 'No camera or microphone was found. Please connect a device and try again.';
          } else if (err.name === 'OverconstrainedError') {
            message = 'Your camera does not support the requested HD resolution. Trying with lower quality...';
            // Try with lower quality (mobile-friendly fallback)
            try {
              const fallbackConstraints = isMobile ? {
                video: { facingMode: 'user' }, // Let device choose resolution
                audio: true
              } : {
                video: { width: { ideal: 640 }, height: { ideal: 480 } },
                audio: true
              };
              const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
              setLocalStream(fallbackStream);
              localStreamRef.current = fallbackStream;
              findNext();
              showToast('Using lower video quality', 'info');
              return;
            } catch (fallbackErr) {
              message = 'Could not access camera/microphone with any quality settings.';
            }
          } else if (err.name === 'NotReadableError') {
            message = 'Camera or microphone is already in use by another application.';
          }
      }
      setError(message);
      showToast(message, 'error');
      setChatState('idle');
    }
  }, [isModelLoading, findNext, isSocketConnected, showToast]);

  const handleReport = () => {
    if (!currentPartner || !currentMatchId) return;
    
    socketService.reportUser(
      currentPartner.id,
      'User reported',
      currentMatchId,
      (response) => {
        if (response.error) {
          console.error('Report error:', response.error);
        } else {
          setBlockedPartners(prev => [...new Set([...prev, currentPartner!.id])]);
          setReportMessage('Partner has been reported and blocked.');
          showToast('User reported and blocked successfully', 'success');
          setTimeout(() => setReportMessage(null), 3500);
          findNext();
        }
      }
    );
  };
  
  const handleSendMessage = (text: string) => {
    if (!text.trim() || !currentMatchId) return;

    // Sanitize input to prevent XSS
    const sanitizedText = text.trim().slice(0, 500);
    
    const userMessage: ChatMessage = { 
      id: `user-${Date.now()}`, 
      text: sanitizedText, 
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    socketService.sendMessage(currentMatchId, sanitizedText, (response) => {
      if (response.error) {
        console.error('Send message error:', response.error);
        const errorMsg = response.error.includes('Rate limit') 
          ? 'You\'re sending messages too quickly. Please slow down.'
          : 'Failed to send message. Please try again.';
        showToast(errorMsg, 'error');
        // Remove the optimistic message if it failed
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      }
    });
  };

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!currentMatchId) return;
    socketService.sendTyping(currentMatchId, isTyping);
  }, [currentMatchId]);
  
  // Socket event listeners
  useEffect(() => {
    if (!isSocketConnected) return;

    const handleMatchFound = (event: { matchId: string; partner: { id: string; name: string } }) => {
      setCurrentMatchId(event.matchId);
      setCurrentPartner({ id: event.partner.id, videoUrl: '' }); // Partner will be from real video stream
      setChatState('connected');
      setVerificationStatus('verifying');
      
      // For now, simulate partner video with sample videos
      // In production, this would be a real WebRTC stream
      const availablePartners = PARTNER_VIDEOS.filter(url => !blockedPartners.includes(url));
      if (availablePartners.length > 0) {
        const randomUrl = availablePartners[Math.floor(Math.random() * availablePartners.length)];
        setCurrentPartner({ id: event.partner.id, videoUrl: randomUrl });
      }
    };

    const handleNewMessage = (event: { id: string; text: string; sender: string; createdAt: string }) => {
      const chatMessage: ChatMessage = {
        id: event.id,
        text: event.text,
        sender: event.sender === 'partner' ? 'partner' : 'user',
        timestamp: event.createdAt || new Date().toISOString()
      };
      setMessages(prev => [...prev, chatMessage]);
    };

    const handlePartnerTyping = (event: { isTyping: boolean }) => {
      setIsPartnerTyping(event.isTyping);
    };

    const handleMatchEnded = () => {
      setChatState('idle');
      setCurrentPartner(null);
      setCurrentMatchId(null);
      setMessages([]);
      cleanupVerification();
    };

    socketService.onMatchFound(handleMatchFound);
    socketService.onMessage(handleNewMessage);
    socketService.onMatchEnded(handleMatchEnded);
    socketService.onTyping(handlePartnerTyping);

    return () => {
      socketService.offMatchFound(handleMatchFound);
      socketService.offMessage(handleNewMessage);
      socketService.offMatchEnded(handleMatchEnded);
      socketService.offTyping(handlePartnerTyping);
    };
  }, [isSocketConnected, blockedPartners, cleanupVerification]);

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

  // Auto-reconnect logic
  useEffect(() => {
    if (!isSocketConnected && chatState !== 'idle') {
      const attemptReconnect = () => {
        reconnectAttemptsRef.current += 1;
        if (reconnectAttemptsRef.current <= 5) {
          showToast(`Reconnecting... (${reconnectAttemptsRef.current}/5)`, 'info');
          socketService.connect()
            .then(() => {
              setIsSocketConnected(true);
              reconnectAttemptsRef.current = 0;
              showToast('Reconnected successfully!', 'success');
            })
            .catch(() => {
              reconnectTimeoutRef.current = window.setTimeout(attemptReconnect, Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000));
            });
        } else {
          showToast('Failed to reconnect. Please refresh the page.', 'error');
        }
      };
      
      reconnectTimeoutRef.current = window.setTimeout(attemptReconnect, 2000);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isSocketConnected, chatState, showToast]);

  // Connection quality monitoring
  useEffect(() => {
    if (!isSocketConnected || !socketService.getConnected()) {
      setConnectionQuality('poor');
      return;
    }

    const checkConnection = () => {
      const startTime = Date.now();
      // Simple ping-pong check
      if (socketService.getConnected()) {
        const latency = Date.now() - startTime;
        if (latency < 50) setConnectionQuality('excellent');
        else if (latency < 100) setConnectionQuality('good');
        else if (latency < 200) setConnectionQuality('fair');
        else setConnectionQuality('poor');
      } else {
        setConnectionQuality('poor');
      }
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [isSocketConnected]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when chat is active and not typing in input
      if (chatState === 'idle' || (e.target as HTMLElement)?.tagName === 'INPUT') {
        return;
      }

      // Ctrl/Cmd + Enter or Space to find next
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (chatState === 'connected' && verificationStatus === 'verified') {
          findNext();
        }
      }

      // Escape to stop chat
      if (e.key === 'Escape') {
        e.preventDefault();
        stopChat(false);
      }

      // M to toggle mute
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (localStream) {
          localStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
          });
        }
      }

      // C to toggle camera
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (localStream) {
          localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [chatState, verificationStatus, findNext, stopChat, localStream]);

  // Handle orientation changes and mobile viewport fixes
  useEffect(() => {
    const handleResize = () => {
      // Fix iOS viewport height issue
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      stopMediaTracks(localStreamRef.current);
      cleanupVerification();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [cleanupVerification]);

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 flex flex-col font-sans">
      {/* Hidden video element to generate partner streams */}
      <video ref={partnerVideoElementRef} style={{ display: 'none' }} crossOrigin="anonymous" playsInline loop muted />
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-md z-20 border-b border-gray-700/50 shadow-lg animate-fadeInDown safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
            Connect<span className="text-blue-400">Sphere</span>
          </h1>
          {chatState !== 'idle' && (
            <button
              onClick={() => stopChat(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-lg hover:shadow-red-500/30 text-sm sm:text-base touch-manipulation"
            >
              Stop
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden animate-fadeIn">
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
            matchId={currentMatchId}
            isPartnerTyping={isPartnerTyping}
            onTyping={handleTyping}
            connectionQuality={connectionQuality}
          />
        )}
      </main>
    </div>
  );
};

export default App;
