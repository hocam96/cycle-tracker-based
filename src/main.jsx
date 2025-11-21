// src/main.jsx
import { sdk } from "@farcaster/miniapp-sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// MiniApp Ready
sdk.actions.ready().catch((err) => {
  console.error("MiniApp READY failed:", err);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
