
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Neural Lab 启动点
 * 在生产环境（Vercel）中，这些日志可以帮助我们通过控制台确认 React 是否成功挂载。
 */
console.log("System: Initiating FocusQuest Neural Lab Protocol...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Failure: Root mount point missing from DOM.");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("System: Protocol Rendered Successfully.");
}
