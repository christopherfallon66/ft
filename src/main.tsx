import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA + auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
      // Check for updates every 5 minutes
      setInterval(() => reg.update(), 5 * 60 * 1000);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
            // New version available - show update prompt
            if (confirm('A new version of Rikers Expert Tracker is available. Reload now?')) {
              window.location.reload();
            }
          }
        });
      });
    } catch (err) {
      console.log('SW registration failed:', err);
    }
  });
}
