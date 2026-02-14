import React, { useEffect } from 'react';

export function Sheet({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const widthClass = width === 'max-w-lg' ? 'max-w-full sm:max-w-lg' : 'max-w-full sm:max-w-md';

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full ${widthClass} bg-white shadow-xl flex flex-col border-l border-slate-200/80 sheet-panel`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        {title && (
          <div className="flex items-center justify-between flex-shrink-0 px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 id="sheet-title" className="text-base font-semibold text-slate-800 truncate pr-4">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </>
  );
}

export default Sheet;
