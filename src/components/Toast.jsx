import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function Toast({ id, type = 'info', message, duration = 4000, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-icon">
        <Icon size={18} />
      </div>
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={handleClose}>
        <X size={14} />
      </button>
    </div>
  );
}
