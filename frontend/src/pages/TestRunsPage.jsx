import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testRunService } from '../services/testRunService';
import { csvService } from '../services/csvService';
import { useLang } from '../context/LangContext';
import { formatDateTime } from '../utils/formatters';
import { STATUS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const TestRunsPage = () => {
  const [testRuns, setTestRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  const { t, lang } = useLang();

  useEffect(() => {
    loadTestRuns();
  }, [page, statusFilter, lang]);

  const loadTestRuns = async () => {
    try {
      setLoading(true);
      const data = await testRunService.getTestRuns({ page, limit: 10, status: statusFilter, lang });
      setTestRuns(data.testRuns);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load test runs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await csvService.exportTestRuns(lang);
      toast.success('Test runs exported successfully');
    } catch (error) {
      toast.error('Failed to export test runs');
    }
  };

  if (loading && testRuns.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="heading-responsive font-bold text-gray-900">{t('nav.testRuns')}</h1>
        <button onClick={handleExport} className="btn btn-secondary text-sm">
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('csv.export')}
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="font-medium text-gray-700">{t('testRun.status')}:</label>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.values(STATUS).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t(`status.${s}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test runs list */}
      <div className="card overflow-x-auto">
        {testRuns.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('testCase.title')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">{t('testRun.tester')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">{t('testRun.status')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">{t('testRun.environment')}</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 hidden sm:table-cell">{t('testRun.executedAt')}</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {testRuns.map((run) => (
                <tr key={run.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link to={`/test-runs/${run.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                      {run.testCase.translations[0]?.title || 'N/A'}
                    </Link>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">{run.tester.name}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">{run.environment || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">{formatDateTime(run.executedAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/test-runs/${run.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      {t('common.view')} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-12">{t('testRun.noResults')}</p>
        )}
      </div>

      {pagination && <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
};

export default TestRunsPage;
