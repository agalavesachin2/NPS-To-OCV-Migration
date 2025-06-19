import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

function mountApp() {
  const container = document.getElementById('careerhub_root'); // match this to your HTML

  if (!container) {
    console.error("'careerhub_root' container not found in the DOM.");
    return;
  }

  console.log("Found careerhub_root container, mounting app...");

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
