
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("System: Starting FocusQuest Engine...");

const rootElement = document.getElementById('root');
const loader = document.getElementById('loader');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 标记成功加载，用于 HTML 内的监控
    (window as any).appLoaded = true;
    
    // 应用渲染完成后移除加载动画
    setTimeout(() => {
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.4s ease-out';
            setTimeout(() => loader.remove(), 400);
        }
        console.log("System: Neural link established.");
    }, 800);
  } catch (err) {
    console.error("System: Mount failed", err);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="color:white; padding:40px; text-align:center; font-family:monospace;">
          <h2 style="color:#f87171">INITIALIZATION ERROR</h2>
          <p style="font-size:12px; margin-top:10px">${err instanceof Error ? err.message : String(err)}</p>
        </div>
      `;
    }
  }
} else {
  console.error("System: Target container #root not found.");
}
