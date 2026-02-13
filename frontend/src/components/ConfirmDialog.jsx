import React from 'react';
import { useLang } from '../context/LangContext';

const ConfirmDialog = ({ open, isOpen, title, message, onConfirm, onCancel }) => {
  const { t } = useLang();
  const visible = open ?? isOpen;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">{message}</p>
        
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <button onClick={onCancel} className="btn btn-secondary flex-1 sm:flex-none">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="btn btn-danger flex-1 sm:flex-none">
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
