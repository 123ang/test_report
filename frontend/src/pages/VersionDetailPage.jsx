import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { versionService } from '../services/versionService';
import { testCaseService } from '../services/testCaseService';
import { csvService } from '../services/csvService';
import { useLang } from '../context/LangContext';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4014/api').replace('/api', '');

const STATUS_STYLES = {
  Open: 'bg-yellow-100 text-yellow-800',
  Fixed: 'bg-blue-100 text-blue-800',
  Verified: 'bg-green-100 text-green-800',
};

const SEVERITY_STYLES = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-gray-100 text-gray-600',
};

const VersionDetailPage = () => {
  const { projectId, versionId } = useParams();
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTC, setEditTC] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ bug: '', test: '', result: '', severity: 'Low', priority: 'Low', notes: '' });
  const [pendingFiles, setPendingFiles] = useState([]); // files to upload for new test case
  const [uploading, setUploading] = useState(false);
  const [viewImages, setViewImages] = useState(null); // { testCaseId, images, title }
  const [lightboxImg, setLightboxImg] = useState(null);
  const fileInputRef = useRef(null);
  const { t } = useLang();

  useEffect(() => { load(); }, [versionId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await versionService.getById(versionId);
      setVersion(data);
    } catch (e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditTC(null);
    setForm({ bug: '', test: '', result: '', severity: 'Low', priority: 'Low', notes: '' });
    setPendingFiles([]);
    setShowForm(true);
  };

  const openEdit = (tc) => {
    setEditTC(tc);
    setForm({ bug: tc.bug, test: tc.test, result: tc.result || '', severity: tc.severity, priority: tc.priority, notes: tc.notes || '' });
    setPendingFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedTC;
      if (editTC) {
        savedTC = await testCaseService.update(editTC.id, form);
        toast.success('Test case updated');
      } else {
        savedTC = await testCaseService.create({ versionId: parseInt(versionId), ...form });
        toast.success('Test case created');
      }
      // Upload any pending files
      if (pendingFiles.length > 0) {
        const tcId = savedTC.id || editTC?.id;
        if (tcId) {
          try {
            setUploading(true);
            await testCaseService.uploadImages(tcId, pendingFiles);
            toast.success(`${pendingFiles.length} photo(s) uploaded`);
          } catch (err) {
            toast.error('Some photos failed to upload');
          } finally { setUploading(false); }
        }
      }
      setShowForm(false);
      setPendingFiles([]);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleToggle = async (tcId, field) => {
    try {
      await testCaseService.toggle(tcId, field);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot toggle');
    }
  };

  const handleDelete = async () => {
    try {
      await testCaseService.remove(deleteId);
      toast.success('Deleted');
      setDeleteId(null);
      load();
    } catch (e) { toast.error('Failed'); }
  };

  const handleExport = async () => {
    try {
      await csvService.exportTestCases({ versionId });
      toast.success('CSV exported');
    } catch (e) { toast.error('Export failed'); }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const res = await csvService.importTestCases(versionId, text);
      toast.success(res.message);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Import failed'); }
    e.target.value = '';
  };

  // Quick upload from table row
  const handleQuickUpload = async (tcId, files) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      await testCaseService.uploadImages(tcId, Array.from(files));
      toast.success(`${files.length} photo(s) uploaded`);
      load();
    } catch (e) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await testCaseService.deleteImage(imageId);
      toast.success('Image deleted');
      // Update local viewImages state
      if (viewImages) {
        setViewImages({
          ...viewImages,
          images: viewImages.images.filter(img => img.id !== imageId),
        });
      }
      load();
    } catch (e) { toast.error('Failed to delete image'); }
  };

  const removePendingFile = (idx) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
  };

  if (loading) return <Loading />;
  if (!version) return <div className="text-center py-12 text-gray-500">Version not found</div>;

  const tcs = version.testCases || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/projects" className="hover:text-gray-700">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-gray-700">{version.project?.name}</Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{version.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{version.project?.name} — {version.name}</h1>
          {version.description && <p className="text-gray-600 mt-1">{version.description}</p>}
          <p className="text-sm text-gray-400 mt-1">{tcs.length} test case(s)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={openCreate} className="btn btn-primary">+ New Test Case</button>
          <button onClick={handleExport} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">Export CSV</button>
          <label className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Test cases table */}
      <div className="card overflow-x-auto">
        {tcs.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-3 font-medium text-gray-500 w-16">ID</th>
                <th className="py-3 px-3 font-medium text-gray-500">BUG</th>
                <th className="py-3 px-3 font-medium text-gray-500">TEST</th>
                <th className="py-3 px-3 font-medium text-gray-500 hidden lg:table-cell">RESULT</th>
                <th className="py-3 px-3 font-medium text-gray-500 hidden md:table-cell">DATE</th>
                <th className="py-3 px-3 font-medium text-gray-500">STATUS</th>
                <th className="py-3 px-3 font-medium text-gray-500 text-center w-20">FIXED</th>
                <th className="py-3 px-3 font-medium text-gray-500 text-center w-24">VERIFIED</th>
                <th className="py-3 px-3 font-medium text-gray-500 text-center w-16">PHOTOS</th>
                <th className="py-3 px-3 font-medium text-gray-500 text-right w-20"></th>
              </tr>
            </thead>
            <tbody>
              {tcs.map(tc => (
                <tr key={tc.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-3 text-gray-400 font-mono text-xs">{tc.id}</td>
                  <td className="py-3 px-3 font-semibold text-gray-900">{tc.bug}</td>
                  <td className="py-3 px-3 text-gray-700 max-w-[200px] truncate">{tc.test}</td>
                  <td className="py-3 px-3 text-gray-600 hidden lg:table-cell max-w-[180px] truncate">{tc.result || '—'}</td>
                  <td className="py-3 px-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                    {new Date(tc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[tc.status] || ''}`}>
                      {tc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={tc.isFixed}
                      onChange={() => handleToggle(tc.id, 'isFixed')}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={tc.isVerified}
                      disabled={!tc.isFixed}
                      onChange={() => handleToggle(tc.id, 'isVerified')}
                      className={`w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 ${tc.isFixed ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                    />
                  </td>
                  {/* Photo column */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {tc.images && tc.images.length > 0 ? (
                        <button
                          onClick={() => setViewImages({ testCaseId: tc.id, images: tc.images, title: tc.bug })}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          title={`${tc.images.length} photo(s)`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-medium">{tc.images.length}</span>
                        </button>
                      ) : (
                        <label className="cursor-pointer text-gray-300 hover:text-blue-500 transition-colors" title="Upload photo">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 4v16m8-8H4" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleQuickUpload(tc.id, e.target.files)}
                          />
                        </label>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(tc)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setDeleteId(tc.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No test cases yet.</p>
            <button onClick={openCreate} className="btn btn-primary">+ New Test Case</button>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 my-8">
            <h2 className="text-lg font-semibold mb-4">{editTC ? 'Edit Test Case' : 'New Test Case'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bug / Category *</label>
                <input type="text" required value={form.bug} onChange={e => setForm({ ...form, bug: e.target.value })}
                  className="input w-full" placeholder="e.g. Login, Cart, Currency" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Description *</label>
                <textarea required value={form.test} onChange={e => setForm({ ...form, test: e.target.value })}
                  className="input w-full" rows={3} placeholder="What do you test?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                <textarea value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}
                  className="input w-full" rows={2} placeholder="Actual result (fill in after testing)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="input w-full">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input w-full">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="input w-full" rows={2} placeholder="Extra notes" />
              </div>

              {/* Photo upload section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photos / Screenshots</label>

                {/* Existing images (only in edit mode) */}
                {editTC && editTC.images && editTC.images.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Existing ({editTC.images.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {editTC.images.map(img => (
                        <div key={img.id} className="relative group">
                          <img
                            src={`${API_BASE}/uploads/${img.filePath}`}
                            alt={img.originalName}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer"
                            onClick={() => setLightboxImg(`${API_BASE}/uploads/${img.filePath}`)}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete image"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending new files preview */}
                {pendingFiles.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">New files to upload ({pendingFiles.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {pendingFiles.map((f, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="w-16 h-16 object-cover rounded-lg border border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePendingFile(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">Add photos (jpg, png, gif, webp — max 5MB each)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setPendingFiles(prev => [...prev, ...Array.from(e.target.files)]);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={uploading} className="btn btn-primary flex-1">
                  {uploading ? 'Uploading...' : (editTC ? 'Save' : 'Create')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setPendingFiles([]); }} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {viewImages && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setViewImages(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Photos — {viewImages.title}</h2>
              <button onClick={() => setViewImages(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {viewImages.images.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No photos yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {viewImages.images.map(img => (
                  <div key={img.id} className="relative group">
                    <img
                      src={`${API_BASE}/uploads/${img.filePath}`}
                      alt={img.originalName}
                      className="w-full h-40 object-cover rounded-lg cursor-pointer border border-gray-200 hover:border-blue-400 transition-colors"
                      onClick={() => setLightboxImg(`${API_BASE}/uploads/${img.filePath}`)}
                    />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Delete photo"
                    >
                      &times;
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{img.originalName}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Upload more photos */}
            <div className="mt-4">
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-gray-500">Upload more photos</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      await handleQuickUpload(viewImages.testCaseId, e.target.files);
                      // Refresh the test case images
                      const updated = await testCaseService.getById(viewImages.testCaseId);
                      setViewImages({ ...viewImages, images: updated.images || [] });
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setLightboxImg(null)}>
          <img
            src={lightboxImg}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-white/40 transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Delete Test Case" message="Are you sure you want to delete this test case?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default VersionDetailPage;
