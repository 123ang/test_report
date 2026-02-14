import React from 'react';
import { useLang } from '../context/LangContext';

const Loading = () => {
  const { t } = useLang();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600">{t('common.loading')}</p>
      </div>
    </div>
  );
};

export default Loading;
