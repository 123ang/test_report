import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testCaseService } from '../services/testCaseService';
import { csvService } from '../services/csvService';
import { useLang } from '../context/LangContext';
import { formatDate } from '../utils/formatters';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const TestCasesPage = () => {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appName, setAppName] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const { t, lang } = useLang();

  useEffect(() => {
    loadTestCases();
  }, [page, lang]);

  const loadTestCases = async () => {
    try {
      setLoading(true);
      const data = await testCaseService.getTestCases({ page, limit: 10, lang, search, appName });
      setTestCases(data.testCases);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadTestCases();
  };

  const handleDelete = async () => {
    try {
      await testCaseService.deleteTestCase(deleteId);
      toast.success('Test case deleted successfully');
      setDeleteId(null);
      loadTestCases();
    } catch (error) {
      toast.error('Failed to delete test case');
    }
  };

  const handleExport = async () => {
    try {
      await csvService.exportTestCases();
      toast.success('Test cases exported successfully');
    } catch (error) {
      toast.error('Failed to export test cases');
    }
  };

  if (loading && testCases.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="heading-responsive font-bold text-gray-900">{t('nav.testCases')}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExport} className="btn btn-secondary text-sm">
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('csv.export')}
          </button>
          <Link to="/test-cases/new" className="btn btn-primary text-sm">
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('testCase.create')}
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder={t('testCase.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="input"
          />
          <input
            type="text"
            placeholder={t('testCase.appName')}
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="input"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            {t('common.search')}
          </button>
        </div>
      </div>

      {/* Test cases list */}
      <div className="card overflow-x-auto">
        {testCases.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('testCase.title')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">{t('testCase.appName')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">{t('testCase.createdBy')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden sm:table-cell">{t('testCase.createdAt')}</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => (
                <tr key={tc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link to={`/test-cases/${tc.id}/edit`} className="text-primary-600 hover:text-primary-700 font-medium">
                      {tc.translations[0]?.title || 'N/A'}
                    </Link>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">{tc.appName}</td>
                  <td className="py-3 px-4 hidden lg:table-cell">{tc.createdBy.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">{formatDate(tc.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/test-cases/${tc.id}/execute`} className="text-green-600 hover:text-green-700 p-2" title={t('testCase.execute')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Link>
                      <Link to={`/test-cases/${tc.id}/edit`} className="text-blue-600 hover:text-blue-700 p-2" title={t('common.edit')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button onClick={() => setDeleteId(tc.id)} className="text-red-600 hover:text-red-700 p-2" title={t('common.delete')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-12">{t('testCase.noResults')}</p>
        )}
      </div>

      {pagination && <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title={t('testCase.delete')}
        message={t('common.confirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default TestCasesPage;
