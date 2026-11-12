import { StrictMode } from "react";
import { registerSW } from 'virtual:pwa-register';
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// import { BrowserRouter } from "react-router-dom";


registerSW({ immediate: true });
createRoot(document.getElementById("root")).render(
  <StrictMode>
      <App />
  </StrictMode>,
);
