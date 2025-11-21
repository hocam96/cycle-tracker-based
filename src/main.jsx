// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Base Mini App console'a "hazırım" diye haber ver
if (typeof window !== "undefined" && window.parent) {
  window.parent.postMessage({ type: "MINI_APP_READY" }, "*");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
