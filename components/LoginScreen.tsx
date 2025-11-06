
import React, { useEffect, useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
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

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [particles] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({ 
      id: i, 
      delay: Math.random() * 5, 
      duration: 10 + Math.random() * 10,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }))
  );

  return (
    <div className="h-full w-full relative flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 overflow-hidden">
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

      {/* Main content */}
      <div className="w-full max-w-md mx-auto text-center relative z-10">
        <div className="animate-fadeInUp">
          <div className="mb-6 inline-block animate-float">
            <div 
              className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-gradient" 
              style={{
                backgroundImage: 'linear-gradient(-45deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6)',
                backgroundSize: '200% 200%',
              }}
            >
              <span className="text-4xl font-bold text-white">C</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wider mb-4 animate-fadeInUp" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            Welcome to Connect<span className="text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Sphere</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-12 animate-fadeInUp" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            Connect with people from around the world.
          </p>
        </div>

        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          <button
            onClick={onLogin}
            className="family group relative inline-flex items-center justify-center w-full sm:w-auto bg-white text-gray-700 font-semibold py-4 px-10 rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 overflow-hidden touch-manipulation"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <GoogleIcon />
            <span className="relative z-10">Sign in with Google</span>
          </button>
          
          <p className="text-xs text-gray-400 mt-8 animate-fadeIn" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            A Google account is required to ensure a safe and moderated community.
          </p>
        </div>
      </div>

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10 animate-pulse-slow pointer-events-none"></div>
    </div>
  );
};
