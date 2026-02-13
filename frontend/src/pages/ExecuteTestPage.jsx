import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { testCaseService } from '../services/testCaseService';
import { testRunService } from '../services/testRunService';
import { useLang } from '../context/LangContext';
import { STATUS, SEVERITY, PRIORITY } from '../utils/constants';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const ExecuteTestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(STATUS.PASS);
  const [actualResult, setActualResult] = useState('');
  const [environment, setEnvironment] = useState('');
  const [severity, setSeverity] = useState('');
  const [priority, setPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshots, setScreenshots] = useState([]);

  useEffect(() => {
    loadTestCase();
  }, [id, lang]);

  const loadTestCase = async () => {
    try {
      const { testCase } = await testCaseService.getTestCaseById(id, lang);
      setTestCase(testCase);
    } catch (error) {
      toast.error('Failed to load test case');
      navigate('/test-cases');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + screenshots.length > 5) {
      toast.error('Maximum 5 screenshots allowed');
      return;
    }
    setScreenshots([...screenshots, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const runData = {
        testCaseId: parseInt(id),
        status,
        actualResult,
        environment,
        severity,
        priority,
        notes
      };

      const { testRun } = await testRunService.createTestRun(runData);

      if (screenshots.length > 0) {
        await testRunService.uploadScreenshots(testRun.id, screenshots);
      }

      toast.success('Test executed successfully');
      navigate('/test-runs');
    } catch (error) {
      toast.error('Failed to execute test');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const translation = testCase.translations[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/test-cases" className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="heading-responsive font-bold text-gray-900">{t('testCase.execute')}</h1>
      </div>

      {/* Test Case Details */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{translation?.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{testCase.appName}</p>
        </div>

        {translation?.description && (
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{t('testCase.description')}</h3>
            <p className="text-gray-700">{translation.description}</p>
          </div>
        )}

        <div>
          <h3 className="font-medium text-gray-900 mb-2">{t('testCase.steps')}</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{translation?.steps}</pre>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-1">{t('testCase.expectedResult')}</h3>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-gray-700">{translation?.expectedResult}</p>
          </div>
        </div>
      </div>

      {/* Execution Form */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('testRun.status')} *</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(STATUS).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                status === s
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {t(`status.${s}`)}
            </button>
          ))}
        </div>

        <div>
          <label className="label">{t('testRun.actualResult')} *</label>
          <textarea
            value={actualResult}
            onChange={(e) => setActualResult(e.target.value)}
            className="textarea"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">{t('testRun.environment')}</label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="input"
              placeholder="Chrome 120 / Windows 11"
            />
          </div>

          <div>
            <label className="label">{t('testRun.severity')}</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="select">
              <option value="">-</option>
              {Object.values(SEVERITY).map(s => (
                <option key={s} value={s}>{t(`severity.${s}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{t('testRun.priority')}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="select">
              <option value="">-</option>
              {Object.values(PRIORITY).map(p => (
                <option key={p} value={p}>{t(`priority.${p}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">{t('testRun.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="textarea"
            rows={3}
          />
        </div>

        <div>
          <label className="label">{t('testRun.screenshots')}</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="input"
          />
          {screenshots.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">{screenshots.length} file(s) selected</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/test-cases" className="btn btn-secondary">
            {t('common.cancel')}
          </Link>
          <button type="submit" disabled={saving} className="btn btn-success disabled:opacity-50">
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExecuteTestPage;
