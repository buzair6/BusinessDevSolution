import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// This is a minimal render function to ensure the app can start.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
