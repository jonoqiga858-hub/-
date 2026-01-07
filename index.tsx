
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("System: Starting FocusQuest Engine...");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
    (window as any).appLoaded = true; // 告知 HTML 诊断工具：应用已成功启动
    console.log("System: Application mounted successfully.");
  } catch (err) {
    console.error("System: Mount failed", err);
    rootElement.innerHTML = `
      <div style="color:white; padding:40px; text-align:center; font-family:monospace;">
        <h2 style="color:#f87171">INITIALIZATION ERROR</h2>
        <p style="font-size:12px; margin-top:10px">${err instanceof Error ? err.message : String(err)}</p>
      </div>
    `;
  }
} else {
  console.error("System: Target container #root not found.");
}
