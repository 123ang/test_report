import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { csvService } from '../services/csvService';
import { projectService } from '../services/projectService';
import { versionService } from '../services/versionService';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const CSVImportPage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [loading, setLoading] = useState(true);

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
      toast.error('Failed to load projects');
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
      toast.success('Template downloaded successfully');
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
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('csv.import')}</h1>

      <div className="card p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('csv.downloadTemplate')}</h2>
          <p className="text-gray-600 mb-4">
            Download the CSV template to see the required format for importing test cases.
          </p>
          <button onClick={handleDownloadTemplate} className="btn btn-secondary">
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('csv.downloadTemplate')}
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Destination</h2>
          <p className="text-gray-600 mb-4">
            Choose which project and version to import the test cases into.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
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
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('csv.selectFile')}</h2>
          <p className="text-gray-600 mb-4">
            Select a CSV file to import test cases. The file should follow the template format.
          </p>
          
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="input"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={!file || !selectedVersion || importing}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {importing ? t('common.loading') : t('csv.importButton')}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">CSV Format Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Required columns: <strong>bug</strong>, <strong>test</strong></li>
            <li>Optional columns: <strong>result</strong>, <strong>severity</strong>, <strong>priority</strong>, <strong>notes</strong></li>
            <li>Severity options: Critical, High, Medium, Low (default: Low)</li>
            <li>Priority options: High, Medium, Low (default: Low)</li>
            <li>All test cases will be imported into the selected version</li>
            <li>Use the template as a reference for proper formatting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CSVImportPage;
