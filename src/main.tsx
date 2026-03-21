import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} else {
  document.body.innerHTML = '<p style="color:#e6edf3;text-align:center;padding:2rem;">Failed to find root element.</p>'
}
