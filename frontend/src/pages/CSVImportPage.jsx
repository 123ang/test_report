import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { csvService } from '../services/csvService';
import { projectService } from '../services/projectService';
import { versionService } from '../services/versionService';
import { useLang } from '../context/LangContext';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { getApiErrorMessage } from '../services/api';
import toast from 'react-hot-toast';

const CSVImportPage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const { setItems: setBreadcrumb } = useBreadcrumb();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBreadcrumb([{ label: t('nav.import'), to: null }]);
  }, [setBreadcrumb, t]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadVersions(selectedProject);
    } else {
      setVersions([]);
      setSelectedVersion('');
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (projectId) => {
    try {
      const data = await versionService.getByProject(projectId);
      setVersions(data);
      if (data.length > 0) setSelectedVersion(data[0].id.toString());
    } catch (e) {
      toast.error(t('csv.loadVersionsFailed'));
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await csvService.downloadTemplate();
      toast.success(t('csv.templateDownloaded'));
    } catch (error) {
      toast.error(t('csv.downloadFailed'));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error(t('csv.invalidFile'));
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(t('csv.selectFileFirst'));
      return;
    }
    if (!selectedVersion) {
      toast.error(t('csv.selectProjectVersion'));
      return;
    }
    setImporting(true);
    try {
      const result = await csvService.importTestCases(parseInt(selectedVersion), file);
      toast.success(result.message);
      navigate(`/projects/${selectedProject}/versions/${selectedVersion}`);
    } catch (error) {
      toast.error(error.response?.data?.error || t('csv.importFailed'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-full space-y-8 max-w-3xl">
      {/* Hero */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary-50 via-white to-primary-50/50 border border-primary-100/80 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-200/20 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{t('csv.import')}</h1>
            <p className="text-slate-600 mt-1">{t('csv.description')}</p>
          </div>
        </div>
      </div>

      {/* Format guidelines – easy to scan */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">1</span>
          {t('csv.step1Title')}
        </h2>
        <p className="text-slate-600 text-sm mb-6">{t('csv.step1Intro')}</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">!</span>
              {t('csv.requiredColumns')}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-sm font-medium">{t('csv.columnBug')}</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-sm font-medium">{t('csv.columnTest')}</span>
            </div>
            <p className="text-slate-500 text-sm mt-2">{t('csv.requiredColumnsDesc')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">{t('csv.optionalColumns')}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">{t('csv.columnResult')}</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">{t('csv.columnSeverity')}</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">{t('csv.columnPriority')}</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">{t('csv.columnNotes')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                <p className="font-medium text-slate-700 mb-1">{t('csv.severityLabel')}</p>
                <p className="text-slate-600">{t('csv.severityOptions')}</p>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                <p className="font-medium text-slate-700 mb-1">{t('csv.priorityLabel')}</p>
                <p className="text-slate-600">{t('csv.priorityOptions')}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 border-t border-slate-100 pt-4">{t('csv.step1Footer')}</p>
        </div>
      </section>

      {/* Step 2: Get template */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">2</span>
          {t('csv.step2Title')}
        </h2>
        <p className="text-slate-600 text-sm mb-4">{t('csv.step2Intro')}</p>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {t('csv.downloadTemplate')}
        </button>
      </section>

      {/* Step 3: Choose destination */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">3</span>
          {t('csv.step3Title')}
        </h2>
        <p className="text-slate-600 text-sm mb-6">{t('csv.step3Intro')}</p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('csv.projectLabel')}</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="input w-full"
              disabled={loading}
            >
              <option value="">{t('csv.selectProject')}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProject && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('csv.versionLabel')}</label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="input w-full"
              >
                <option value="">{t('csv.selectVersion')}</option>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Step 4: Upload & import */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">4</span>
          {t('csv.step4Title')}
        </h2>
        <p className="text-slate-600 text-sm mb-6">{t('csv.step4Intro')}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('csv.csvFileLabel')}</label>
            <div className="relative flex items-center gap-3">
              <label
                htmlFor="csv-file-input"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-0 bg-primary-50 text-primary-700 font-medium cursor-pointer hover:bg-primary-100 transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {t('csv.chooseFile')}
              </label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-sm text-slate-600">{file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : t('csv.noFileSelected')}</span>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={!file || !selectedVersion || importing}
            className="btn btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            {importing ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                {t('common.loading')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {t('csv.importButton')}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CSVImportPage;
