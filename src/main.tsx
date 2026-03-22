import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'

console.log('[ASCII-Gen] Entry module loaded.');

// Signal mount as early as possible to prevent the HTML timeout from firing.
// Even if rendering fails, React has loaded and we handle errors in-app.
(window as any).__reactMounted = true;

const root = document.getElementById('root')

if (root) {
  try {
    console.log('[ASCII-Gen] Creating React root...');
    createRoot(root).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    )
    console.log('[ASCII-Gen] React render scheduled successfully.');
    console.log('[ASCII-Gen] App mounted.');
  } catch (e) {
    console.error('[ASCII-Gen] React mount failed:', e);
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0d1117;color:#e6edf3;font-family:sans-serif;text-align:center;padding:2rem;">
        <h1 style="font-size:1.5rem;margin-bottom:1rem;">Failed to start</h1>
        <p style="color:#8b949e;margin-bottom:1rem;max-width:500px;">${(e as Error).message || 'Unknown error'}</p>
        <pre style="color:#8b949e;font-size:0.75rem;max-width:600px;overflow:auto;margin-bottom:1rem;text-align:left;">${(e as Error).stack || ''}</pre>
        <button onclick="location.reload()" style="padding:0.6rem 1.2rem;background:#7c3aed;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:600;">Reload Page</button>
      </div>
    `;
  }
} else {
  console.error('[ASCII-Gen] Root element not found!');
  document.body.innerHTML = '<p style="color:#e6edf3;text-align:center;padding:2rem;">Failed to find root element.</p>'
}
