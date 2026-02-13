import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testRunService } from '../services/testRunService';
import { useLang } from '../context/LangContext';
import { formatDateTime } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const TestRunDetailPage = () => {
  const { id } = useParams();
  const { t, lang } = useLang();
  const [testRun, setTestRun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestRun();
  }, [id, lang]);

  const loadTestRun = async () => {
    try {
      const { testRun } = await testRunService.getTestRunById(id, lang);
      setTestRun(testRun);
    } catch (error) {
      toast.error('Failed to load test run');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!testRun) return <div>Test run not found</div>;

  const translation = testRun.testCase.translations[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/test-runs" className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="heading-responsive font-bold text-gray-900">{t('testRun.status')}</h1>
      </div>

      {/* Test Run Info */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{translation?.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{testRun.testCase.appName}</p>
          </div>
          <StatusBadge status={testRun.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">{t('testRun.tester')}</p>
            <p className="font-medium text-gray-900">{testRun.tester.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('testRun.executedAt')}</p>
            <p className="font-medium text-gray-900">{formatDateTime(testRun.executedAt)}</p>
          </div>
          {testRun.environment && (
            <div>
              <p className="text-sm text-gray-600">{t('testRun.environment')}</p>
              <p className="font-medium text-gray-900">{testRun.environment}</p>
            </div>
          )}
          {testRun.severity && (
            <div>
              <p className="text-sm text-gray-600">{t('testRun.severity')}</p>
              <p className="font-medium text-gray-900">{t(`severity.${testRun.severity}`)}</p>
            </div>
          )}
          {testRun.priority && (
            <div>
              <p className="text-sm text-gray-600">{t('testRun.priority')}</p>
              <p className="font-medium text-gray-900">{t(`priority.${testRun.priority}`)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Case Details */}
      <div className="card space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('testCase.steps')}</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{translation?.steps}</pre>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('testCase.expectedResult')}</h3>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-gray-700">{translation?.expectedResult}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('testRun.actualResult')}</h3>
          <div className={`rounded-lg p-4 ${
            testRun.status === 'pass' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <p className="text-gray-700">{testRun.actualResult || '-'}</p>
          </div>
        </div>

        {testRun.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('testRun.notes')}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{testRun.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Screenshots */}
      {testRun.images && testRun.images.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('testRun.screenshots')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {testRun.images.map((image) => (
              <a
                key={image.id}
                href={`http://localhost:5000${image.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors"
              >
                <img
                  src={`http://localhost:5000${image.filePath}`}
                  alt={image.originalName}
                  className="w-full h-48 object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunDetailPage;
