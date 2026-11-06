import React from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export default function FeedbackMessage({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`flex items-start justify-between p-4 mb-4 rounded-xl border transition-all ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-800'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
        )}
        <div className="text-sm font-medium leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition p-1"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

