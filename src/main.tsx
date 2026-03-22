import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'

console.log('[ASCII-Gen] Starting app...');

const root = document.getElementById('root')

if (root) {
  try {
    createRoot(root).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
    // Signal to the HTML fallback timeout that React has mounted
    ;(window as any).__reactMounted = true;
    console.log('[ASCII-Gen] React mounted successfully.');
  } catch (e) {
    console.error('[ASCII-Gen] React mount failed:', e);
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0d1117;color:#e6edf3;font-family:sans-serif;text-align:center;padding:2rem;">
        <h1 style="font-size:1.5rem;margin-bottom:1rem;">Failed to start</h1>
        <p style="color:#8b949e;margin-bottom:1rem;">${(e as Error).message || 'Unknown error'}</p>
        <button onclick="location.reload()" style="padding:0.6rem 1.2rem;background:#7c3aed;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:600;">Reload Page</button>
      </div>
    `;
  }
} else {
  document.body.innerHTML = '<p style="color:#e6edf3;text-align:center;padding:2rem;">Failed to find root element.</p>'
}
