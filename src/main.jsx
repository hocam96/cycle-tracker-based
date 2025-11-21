// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Farcaster Mini App SDK
import { sdk } from "@farcaster/miniapp-sdk";

// Ready action: Base/Farcaster "Ready call" buradan geliyor
if (typeof window !== "undefined") {
  sdk.actions
    .ready()
    .catch(() => {
      // Warpcast / Farcaster dışında açıldığında hata verse bile
      // app'in kırılmaması için hata yutuyoruz.
    });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
