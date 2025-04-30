import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UploadProgressProps {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ status, progress, message }) => {
  if (status === 'idle') return null;

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {status === 'success' && (
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        )}
        {status === 'error' && (
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        )}
        {(status === 'uploading' || status === 'processing') && (
          <Loader className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
        )}
        <span className={`text-sm font-medium ${
          status === 'success' ? 'text-green-700' :
          status === 'error' ? 'text-red-700' :
          'text-blue-700'
        }`}>
          {message || `${Math.round(progress)}%`}
        </span>
      </div>
      {(status === 'uploading' || status === 'processing') && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;