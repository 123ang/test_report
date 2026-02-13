import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { testCaseService } from '../services/testCaseService';
import { useLang } from '../context/LangContext';
import { TEST_CASE_TEMPLATES, getTemplateByKey } from '../utils/templates';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const TestCaseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [appName, setAppName] = useState('');
  const [templateKey, setTemplateKey] = useState('custom');
  const [activeTab, setActiveTab] = useState('en');
  const [translations, setTranslations] = useState({
    en: { title: '', description: '', steps: '', expectedResult: '' },
    ja: { title: '', description: '', steps: '', expectedResult: '' }
  });

  useEffect(() => {
    if (isEdit) {
      loadTestCase();
    }
  }, [id]);

  const loadTestCase = async () => {
    try {
      const { testCase } = await testCaseService.getTestCaseById(id);
      setAppName(testCase.appName);
      setTemplateKey(testCase.templateKey || 'custom');
      
      const translationsMap = {};
      testCase.translations.forEach(t => {
        translationsMap[t.language] = {
          title: t.title,
          description: t.description || '',
          steps: t.steps,
          expectedResult: t.expectedResult
        };
      });
      setTranslations({ ...translations, ...translationsMap });
    } catch (error) {
      toast.error('Failed to load test case');
      navigate('/test-cases');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (key) => {
    setTemplateKey(key);
    if (key !== 'custom') {
      const template = getTemplateByKey(key);
      if (template) {
        setTranslations({
          en: { ...template.translations.en },
          ja: { ...template.translations.ja }
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        appName,
        templateKey,
        translations: [
          { language: 'en', ...translations.en },
          { language: 'ja', ...translations.ja }
        ]
      };

      if (isEdit) {
        await testCaseService.updateTestCase(id, data);
        toast.success('Test case updated successfully');
      } else {
        await testCaseService.createTestCase(data);
        toast.success('Test case created successfully');
      }
      navigate('/test-cases');
    } catch (error) {
      toast.error(isEdit ? 'Failed to update test case' : 'Failed to create test case');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/test-cases" className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="heading-responsive font-bold text-gray-900">
          {isEdit ? t('testCase.edit') : t('testCase.create')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('testCase.appName')} *</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">{t('testCase.template')}</label>
              <select
                value={templateKey}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="select"
                disabled={isEdit}
              >
                {TEST_CASE_TEMPLATES.map(template => (
                  <option key={template.key} value={template.key}>
                    {template.translations[lang]?.title || template.translations.en.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="card">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'en'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ja')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'ja'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              日本語
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">{t('testCase.title')} *</label>
              <input
                type="text"
                value={translations[activeTab].title}
                onChange={(e) => setTranslations({
                  ...translations,
                  [activeTab]: { ...translations[activeTab], title: e.target.value }
                })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">{t('testCase.description')}</label>
              <textarea
                value={translations[activeTab].description}
                onChange={(e) => setTranslations({
                  ...translations,
                  [activeTab]: { ...translations[activeTab], description: e.target.value }
                })}
                className="textarea"
                rows={3}
              />
            </div>

            <div>
              <label className="label">{t('testCase.steps')} *</label>
              <textarea
                value={translations[activeTab].steps}
                onChange={(e) => setTranslations({
                  ...translations,
                  [activeTab]: { ...translations[activeTab], steps: e.target.value }
                })}
                className="textarea"
                rows={6}
                required
                placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
              />
            </div>

            <div>
              <label className="label">{t('testCase.expectedResult')} *</label>
              <textarea
                value={translations[activeTab].expectedResult}
                onChange={(e) => setTranslations({
                  ...translations,
                  [activeTab]: { ...translations[activeTab], expectedResult: e.target.value }
                })}
                className="textarea"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/test-cases" className="btn btn-secondary">
            {t('common.cancel')}
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50">
            {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestCaseFormPage;
