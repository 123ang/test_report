import React from 'react';
import { useLang } from '../context/LangContext';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const { t } = useLang();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="btn btn-secondary">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
