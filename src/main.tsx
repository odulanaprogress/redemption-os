
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { initSentry } from "./config/sentry.config";

  initSentry();

  // Register service worker for offline caching capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('⚡ [Service Worker] Registered successfully with scope:', registration.scope);
        })
        .catch(error => {
          console.error('❌ [Service Worker] Registration failed:', error);
        });
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
  