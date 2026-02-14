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
      toast.error('Failed to load versions');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await csvService.downloadTemplate();
      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    if (!selectedVersion) {
      toast.error('Please select a project and version');
      return;
    }
    setImporting(true);
    try {
      const result = await csvService.importTestCases(parseInt(selectedVersion), file);
      toast.success(result.message);
      navigate(`/projects/${selectedProject}/versions/${selectedVersion}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import CSV');
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
            <p className="text-slate-600 mt-1">Upload a CSV file to add many test cases at once. Pick a project and version, then follow the format guidelines below.</p>
          </div>
        </div>
      </div>

      {/* Format guidelines – easy to scan */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">1</span>
          Format guidelines
        </h2>
        <p className="text-slate-600 text-sm mb-6">Your CSV must have a header row. Use the template so you don’t miss any columns.</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">!</span>
              Required columns
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-sm font-medium">bug</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-sm font-medium">test</span>
            </div>
            <p className="text-slate-500 text-sm mt-2">Every row must have a short title (<strong>bug</strong>) and a description of the test (<strong>test</strong>).</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Optional columns</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">result</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">severity</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">priority</span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">notes</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                <p className="font-medium text-slate-700 mb-1">Severity</p>
                <p className="text-slate-600">Critical, High, Medium, Low. Default: <strong>Low</strong>.</p>
              </div>
              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                <p className="font-medium text-slate-700 mb-1">Priority</p>
                <p className="text-slate-600">High, Medium, Low. Default: <strong>Low</strong>.</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 border-t border-slate-100 pt-4">All imported rows are added to the version you choose in step 3. Use the template below to get the exact column names and an example row.</p>
        </div>
      </section>

      {/* Step 2: Get template */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">2</span>
          Get the template
        </h2>
        <p className="text-slate-600 text-sm mb-4">Download the CSV template with the correct headers and a sample row. Fill it in with your test cases, then upload it in step 4.</p>
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
          Choose destination
        </h2>
        <p className="text-slate-600 text-sm mb-6">Select the project and version where the test cases will be added.</p>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="input w-full"
              disabled={loading}
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProject && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Version</label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="input w-full"
              >
                <option value="">Select a version...</option>
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
          Upload and import
        </h2>
        <p className="text-slate-600 text-sm mb-6">Select your CSV file (the one you filled from the template), then click Import.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">CSV file</label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium file:cursor-pointer hover:file:bg-primary-100 transition-colors"
              />
            </div>
            {file && (
              <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
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
