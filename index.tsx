
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error('ERROR: VITE_GOOGLE_CLIENT_ID environment variable is required');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <App />
    ) : (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: 'red',
        fontSize: '18px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h1>Configuration Error</h1>
          <p>VITE_GOOGLE_CLIENT_ID environment variable is required.</p>
          <p>Please configure your Google OAuth client ID in your .env file.</p>
        </div>
      </div>
    )}
  </React.StrictMode>
);
