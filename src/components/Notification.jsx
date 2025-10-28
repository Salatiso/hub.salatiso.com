import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const Notification = ({ message, type = 'info', onClose, autoClose = true, duration = 5000 }) => {
  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 border-green-500';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500';
      case 'error':
        return 'bg-red-100 dark:bg-red-900 border-red-500';
      default:
        return 'bg-blue-100 dark:bg-blue-900 border-blue-500';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border-l-4 shadow-lg ${getBgColor()} dark:text-white`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
