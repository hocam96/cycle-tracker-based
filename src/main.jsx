// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";

import { sdk } from "@farcaster/miniapp-sdk";

import App from "./App.jsx";
import "./index.css";

// Warpcast ortamında mini app için hazır sinyali
sdk
  .ready()
  .then(() => {
    console.log("[miniapp] sdk.ready() called");
  })
  .catch((err) => {
    console.error("[miniapp] sdk.ready() failed", err);
  });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
