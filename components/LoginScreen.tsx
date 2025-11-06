
import React from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

const GoogleIcon: React.FC = () => (
  <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M24 9.5c3.23 0 6.13 1.11 8.4 3.29l6.31-6.31C34.91 2.89 29.83 1 24 1 14.85 1 7.22 6.43 4.21 14.21l7.69 5.99C13.48 13.93 18.32 9.5 24 9.5z"></path>
    <path fill="#34A853" d="M46.21 25.13c0-1.63-.15-3.2-.42-4.7H24v8.89h12.45c-.54 2.87-2.14 5.31-4.63 6.96l7.38 5.75C43.38 38.38 46.21 32.25 46.21 25.13z"></path>
    <path fill="#FBBC05" d="M11.9 20.2c-1.03-3.08-1.03-6.52 0-9.6l-7.69-5.99C1.65 10.33 0 16.95 0 24c0 7.05 1.65 13.67 4.21 19.39l7.69-5.99c-1.03-3.08-1.03-6.52 0-9.6z"></path>
    <path fill="#EA4335" d="M24 47c5.83 0 10.91-1.89 14.59-5.18l-7.38-5.75c-2.49 1.65-5.59 2.64-9.21 2.64-5.68 0-10.52-4.43-12.1-10.21l-7.69 5.99C7.22 41.57 14.85 47 24 47z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md mx-auto text-center relative z-10 animate-fadeInUp">
        <div className="mb-8 animate-scaleIn">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-wider mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
            Welcome to Connect<span className="text-blue-400 animate-pulse-glow">Sphere</span>
          </h1>
        </div>
        
        <p className="text-xl text-gray-300 mb-12 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          Connect with people from around the world
        </p>
        
        <div className="animate-fadeIn" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <button
            onClick={onLogin}
            className="group relative inline-flex items-center justify-center w-full sm:w-auto bg-white text-gray-700 font-semibold py-4 px-10 rounded-xl shadow-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            <GoogleIcon />
            <span className="relative">Sign in with Google</span>
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mt-8 animate-fadeIn" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          A Google account is required to ensure a safe and moderated community.
        </p>
      </div>
    </div>
  );
};
