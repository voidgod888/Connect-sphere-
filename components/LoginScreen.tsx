
import React from 'react';
import { apiService } from '../services/apiService';

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
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth
    window.location.href = apiService.getGoogleAuthUrl();
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wider mb-4">
          Welcome to Connect<span className="text-blue-400">Sphere</span>
        </h1>
        <p className="text-lg text-gray-400 mb-12">
          Connect with people from around the world.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-gray-700 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
        <p className="text-xs text-gray-500 mt-8">
          A Google account is required to ensure a safe and moderated community.
        </p>
      </div>
    </div>
  );
};
