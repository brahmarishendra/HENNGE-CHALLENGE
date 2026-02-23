import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import App from './app.tsx';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Failed to get the application markup.');
}

createRoot(app).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
