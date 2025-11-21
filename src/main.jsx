// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Farcaster mini app SDK (isteğe bağlı ama şu an zaten kullanıyorsun)
import { sdk } from "@farcaster/miniapp-sdk";

// Farcaster tarafına "hazırım" sinyali
sdk.ready();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
