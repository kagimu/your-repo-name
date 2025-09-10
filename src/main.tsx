import 'vite/modulepreload-polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HelmetProvider>
       <App />
    </HelmetProvider>
   
  </React.StrictMode>
);
