import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { csvService } from '../services/csvService';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const CSVImportPage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

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

    setImporting(true);
    try {
      const result = await csvService.importTestCases(file);
      toast.success(result.message);
      navigate('/test-cases');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="heading-responsive font-bold text-gray-900">{t('csv.import')}</h1>

      <div className="card space-y-6">
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
              disabled={!file || importing}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {importing ? t('common.loading') : t('csv.importButton')}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">CSV Format Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Each row represents one translation of a test case</li>
            <li>Use pipe (|) to separate steps within a cell</li>
            <li>Language column must be "en" or "ja"</li>
            <li>At minimum, an English (en) row is required</li>
            <li>Rows with the same appName + title are grouped as translations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CSVImportPage;
