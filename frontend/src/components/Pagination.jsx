import { useLang } from '../context/LangContext';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useLang();

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {t('common.previous')}
      </button>

      <div className="flex items-center gap-2">
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg border transition-colors ${
              page === currentPage
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {t('common.next')}
      </button>
    </div>
  );
};

export default Pagination;
