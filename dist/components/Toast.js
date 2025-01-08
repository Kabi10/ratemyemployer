"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastProvider = exports.useToast = void 0;
const react_1 = require("react");
const outline_1 = require("@heroicons/react/24/outline");
const ToastContext = (0, react_1.createContext)(undefined);
function useToast() {
    const context = (0, react_1.useContext)(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
exports.useToast = useToast;
function ToastProvider({ children }) {
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const showToast = (0, react_1.useCallback)((message, type) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);
    const removeToast = (0, react_1.useCallback)((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);
    const getToastStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-500 text-green-700 dark:bg-green-800 dark:text-green-100';
            case 'error':
                return 'bg-red-100 border-red-500 text-red-700 dark:bg-red-800 dark:text-red-100';
            case 'warning':
                return 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100';
            default:
                return 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-800 dark:text-blue-100';
        }
    };
    return (<ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (<div key={toast.id} className={`flex items-center justify-between p-4 rounded-lg shadow-lg border-l-4 ${getToastStyles(toast.type)}`}>
            <p className="mr-8">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <outline_1.XMarkIcon className="h-5 w-5"/>
            </button>
          </div>))}
      </div>
    </ToastContext.Provider>);
}
exports.ToastProvider = ToastProvider;
