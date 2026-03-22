import type { StartupStatus } from '../hooks/useStartupCheck';

interface StartupBadgeProps {
  status: StartupStatus;
  message: string;
}

const STATUS_CONFIG: Record<StartupStatus, { label: string; className: string }> = {
  checking: { label: 'Checking...', className: 'startup-badge startup-checking' },
  ready: { label: 'Ready', className: 'startup-badge startup-ready' },
  fallback: { label: 'Using fallback', className: 'startup-badge startup-fallback' },
  error: { label: 'Error — using fallback', className: 'startup-badge startup-error' },
};

export function StartupBadge({ status, message }: StartupBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={config.className} title={message}>
      {config.label}
    </span>
  );
}
