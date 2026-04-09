import React from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  type?: "success" | "error" | "info";
  title?: string;
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type = "success",
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle className="h-6 w-6 text-green-500" />,
    error: <AlertCircle className="h-6 w-6 text-red-500" />,
    info: <Info className="h-6 w-6 text-blue-500" />,
  };

  const bgColorMap = {
    success: "bg-green-50 dark:bg-green-900/20",
    error: "bg-red-50 dark:bg-red-900/20",
    info: "bg-blue-50 dark:bg-blue-900/20",
  };

  const borderColorMap = {
    success: "border-green-200 dark:border-green-800",
    error: "border-red-200 dark:border-red-800",
    info: "border-blue-200 dark:border-blue-800",
  };

  const defaultTitle = {
    success: "Success",
    error: "Error",
    info: "Information",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${bgColorMap[type]} ${borderColorMap[type]} rounded-full p-2 border-2`}>
            {iconMap[type]}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title || defaultTitle[type]}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              type === "success"
                ? "bg-green-500 text-white hover:bg-green-600"
                : type === "error"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
