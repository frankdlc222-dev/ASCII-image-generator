import type { AppStatus, GenerationProgress } from '../types';

interface StatusPanelProps {
  status: AppStatus;
  message: string;
  progress: GenerationProgress | null;
  error: string | null;
}

export function StatusPanel({ status, message, progress, error }: StatusPanelProps) {
  if (status === 'idle') return null;

  const isLoading = [
    'checking-capability',
    'downloading-model',
    'initializing-model',
    'generating',
    'converting',
  ].includes(status);

  return (
    <div className={`status-panel status-${status}`}>
      <div className="status-content">
        {isLoading && <span className="spinner" />}
        <span className="status-message">{message}</span>
      </div>

      {progress && status === 'downloading-model' && (
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, progress.progress)}%` }}
          />
          <span className="progress-text">{Math.round(progress.progress)}%</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}
