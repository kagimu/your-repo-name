import 'vite/modulepreload-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('Service Worker registered:', reg.scope);
      })
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HelmetProvider>
       <App />
    </HelmetProvider>
   
  </React.StrictMode>
);
