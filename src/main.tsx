
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { initSentry } from "./config/sentry.config";

  initSentry();

  createRoot(document.getElementById("root")!).render(<App />);
  