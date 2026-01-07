
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("System: Starting FocusQuest Engine...");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    // 移除 StrictMode 以排查环境兼容性问题，并确保单次挂载成功
    root.render(<App />);
    console.log("System: Application mounted.");
  } catch (err) {
    console.error("System: Mount failed", err);
    rootElement.innerHTML = `<div style="color:white; padding:20px;">Initialization Error: ${err.message}</div>`;
  }
} else {
  console.error("System: Target container #root not found.");
}
