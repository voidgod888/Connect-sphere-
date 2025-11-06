
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface LoginScreenProps {
  onGoogleLogin: (credential: string) => void;
  onAppleLogin: (identityToken: string, fullName?: string) => void;
  isLoading: boolean;
  error?: string | null;
  onError?: (message: string | null) => void;
}

const GoogleIcon: React.FC = () => (
  <svg className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M24 9.5c3.23 0 6.13 1.11 8.4 3.29l6.31-6.31C34.91 2.89 29.83 1 24 1 14.85 1 7.22 6.43 4.21 14.21l7.69 5.99C13.48 13.93 18.32 9.5 24 9.5z"></path>
    <path fill="#34A853" d="M46.21 25.13c0-1.63-.15-3.2-.42-4.7H24v8.89h12.45c-.54 2.87-2.14 5.31-4.63 6.96l7.38 5.75C43.38 38.38 46.21 32.25 46.21 25.13z"></path>
    <path fill="#FBBC05" d="M11.9 20.2c-1.03-3.08-1.03-6.52 0-9.6l-7.69-5.99C1.65 10.33 0 16.95 0 24c0 7.05 1.65 13.67 4.21 19.39l7.69-5.99c-1.03-3.08-1.03-6.52 0-9.6z"></path>
    <path fill="#EA4335" d="M24 47c5.83 0 10.91-1.89 14.59-5.18l-7.38-5.75c-2.49 1.65-5.59 2.64-9.21 2.64-5.68 0-10.52-4.43-12.1-10.21l-7.69 5.99C7.22 41.57 14.85 47 24 47z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);

const AppleIcon: React.FC = () => (
  <svg className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.366 1.43c0 1.14-.832 2.59-2.014 3.43-.888.65-2.07 1.16-3.23 1.08-.11-1.09.32-2.35 1.1-3.17.86-.89 2.16-1.54 3.26-1.67.06.1.086.24.086.33l-.002-.002zm4.3 16.11c-.64 1.32-1.4 2.62-2.51 2.64-1.11.02-1.46-.85-2.72-.85s-1.67.83-2.73.87c-1.06.04-1.87-1.41-2.5-2.71-1.36-2.8-2.33-7.91-.97-10.5.67-1.27 1.86-2.07 3.15-2.09 1.07-.02 2.08.74 2.73.74.64 0 1.89-.91 3.19-.78.54.02 2.07.22 3.05 1.66-.08.05-1.82 1.07-1.8 3.19.03 2.53 2.12 3.36 2.15 3.38-.03.07-.33 1.15-1.44 2.55z" />
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleLogin,
  onAppleLogin,
  isLoading,
  error,
  onError,
}) => {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }))
  );

  const [googleReady, setGoogleReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined;
  const appleScope = import.meta.env.VITE_APPLE_SCOPE || 'name email';
  const appleRedirectUrl = useMemo(() => {
    if (import.meta.env.VITE_APPLE_REDIRECT_URI) {
      return import.meta.env.VITE_APPLE_REDIRECT_URI as string;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/apple/callback`;
    }
    return '';
  }, []);

  const appleState = useMemo(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2, 10);
  }, []);

  const reportError = useCallback((message: string | null) => {
    setLocalError(message);
    onError?.(message);
  }, [onError]);

  useEffect(() => {
    if (!googleClientId) {
      reportError('Google client ID is not configured.');
      return;
    }

    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    let cancelled = false;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
      } else {
        reportError('Google authentication SDK failed to load.');
      }
    };
    script.onerror = () => {
      if (!cancelled) {
        reportError('Unable to load Google authentication SDK.');
      }
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      document.head.removeChild(script);
    };
  }, [googleClientId, reportError]);

  useEffect(() => {
    if (!appleClientId) {
      reportError('Apple client ID is not configured.');
      return;
    }

    const initApple = () => {
      if (!window.AppleID?.auth) {
        return false;
      }
      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: appleScope,
        redirectURI: appleRedirectUrl,
        state: appleState,
        usePopup: true,
      });
      setAppleReady(true);
      return true;
    };

    if (initApple()) {
      return;
    }

    let cancelled = false;
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (cancelled) return;
      if (!initApple()) {
        reportError('Apple authentication SDK failed to load.');
      }
    };
    script.onerror = () => {
      if (!cancelled) {
        reportError('Unable to load Apple authentication SDK.');
      }
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      document.head.removeChild(script);
    };
  }, [appleClientId, appleScope, appleRedirectUrl, appleState, reportError]);

  const handleGoogleClick = useCallback(() => {
    if (isLoading) return;
    if (!googleClientId || !window.google?.accounts?.id) {
      reportError('Google Sign-In is not available right now.');
      return;
    }
    reportError(null);
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: GoogleCredentialResponse) => {
        if (response.credential) {
          onGoogleLogin(response.credential);
        } else {
          reportError('Google sign-in did not return a credential.');
        }
      },
      auto_select: false,
      ux_mode: 'popup',
      itp_support: true,
    });
    window.google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.()) {
        reportError('Google sign-in prompt was blocked. Please allow pop-ups or try again.');
      }
    });
  }, [googleClientId, isLoading, onGoogleLogin, reportError]);

  const handleAppleClick = useCallback(async () => {
    if (isLoading) return;
    if (!appleClientId || !window.AppleID?.auth) {
      reportError('Apple Sign-In is not available right now.');
      return;
    }
    reportError(null);
    try {
      const response = await window.AppleID.auth.signIn();
      const identityToken = response?.authorization?.id_token;
      if (!identityToken) {
        reportError('Apple sign-in did not return an identity token.');
        return;
      }
      const firstName = response.user?.name?.firstName ?? '';
      const lastName = response.user?.name?.lastName ?? '';
      const fullName = `${firstName} ${lastName}`.trim() || undefined;
      onAppleLogin(identityToken, fullName);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'error' in err) {
        const code = (err as { error?: string }).error;
        if (code === 'popup_closed_by_user' || code === 'user_cancelled_authorize') {
          return;
        }
      }
      reportError('Apple sign-in was cancelled or failed. Please try again.');
    }
  }, [appleClientId, isLoading, onAppleLogin, reportError]);

  const googleDisabled = !googleReady || !googleClientId || isLoading;
  const appleDisabled = !appleReady || !appleClientId || !appleRedirectUrl || isLoading;
  const displayError = error ?? localError;

  return (
    <div className="h-full w-full relative flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 overflow-hidden">
    <div className="h-full w-full relative flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 overflow-hidden safe-area-top safe-area-bottom">
      {/* Animated background particles */}
      <div className="particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md mx-auto text-center relative z-10">
        <div className="animate-fadeInUp">
          <div className="mb-6 inline-block animate-float">
            <div
              className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-gradient"
          <div className="mb-4 sm:mb-6 inline-block animate-float">
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-gradient" 
              style={{
                backgroundImage: 'linear-gradient(-45deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6)',
                backgroundSize: '200% 200%',
              }}
            >
              <span className="text-3xl sm:text-4xl font-bold text-white">C</span>
            </div>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold text-white tracking-wider mb-4 animate-fadeInUp"
            style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
          >
            Welcome to Connect
            <span className="text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Sphere</span>
          </h1>

          <p
            className="text-lg text-gray-300 mb-12 animate-fadeInUp"
            style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
          >
            Securely join global conversations with verified identities.
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wider mb-3 sm:mb-4 px-2 animate-fadeInUp" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            Welcome to Connect<span className="text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Sphere</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-12 px-4 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            Connect with people from around the world.
          </p>
        </div>

        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={googleDisabled}
              className={`group relative inline-flex items-center justify-center w-full bg-white text-gray-700 font-semibold py-4 px-6 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 overflow-hidden ${googleDisabled ? 'opacity-60 cursor-not-allowed hover:scale-100' : 'hover:shadow-blue-500/20'}`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <GoogleIcon />
              <span className="relative z-10">Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleClick}
              disabled={appleDisabled}
              className={`group relative inline-flex items-center justify-center w-full bg-black text-white font-semibold py-4 px-6 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/40 overflow-hidden ${appleDisabled ? 'opacity-60 cursor-not-allowed hover:scale-100' : 'hover:shadow-gray-800/40'}`}
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <AppleIcon />
              <span className="relative z-10">Continue with Apple</span>
            </button>
          </div>

          <p
            className="text-xs text-gray-400 mt-6 animate-fadeIn"
            style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}
          >
            Authentication is required to keep our community safe. We never store your passwords.
          <button
            onClick={onLogin}
            className="family group relative inline-flex items-center justify-center w-full sm:w-auto bg-white text-gray-700 font-semibold py-3 sm:py-4 px-6 sm:px-10 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 overflow-hidden touch-manipulation"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <GoogleIcon />
            <span className="relative z-10 text-sm sm:text-base">Sign in with Google</span>
          </button>
          
          <p className="text-xs text-gray-400 mt-6 sm:mt-8 px-4 animate-fadeIn" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            A Google account is required to ensure a safe and moderated community.
          </p>

          {displayError && (
            <div className="mt-6 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg shadow-lg shadow-red-500/20 animate-fadeIn">
              {displayError}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10 animate-pulse-slow pointer-events-none"></div>
    </div>
  );
};
