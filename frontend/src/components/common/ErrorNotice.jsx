import { AlertCircle } from 'lucide-react';

export default function ErrorNotice({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={19} />
      <span>{message}</span>
      {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
    </div>
  );
}
