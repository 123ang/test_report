import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { versionService } from '../services/versionService';
import { testCaseService } from '../services/testCaseService';
import { csvService } from '../services/csvService';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { Badge, Sheet } from '../components/ui';
import { BUG_TEMPLATES, getBugTemplate } from '../utils/bugTemplates';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4014/api').replace('/api', '');

export default function VersionDetailPage() {
  const { projectId, versionId } = useParams();
  const [version, setVersion] = useState(null);
  const [versionsList, setVersionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailTc, setDetailTc] = useState(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editTc, setEditTc] = useState(null);
  const [form, setForm] = useState({ bug: '', test: '', result: '', severity: 'Low', priority: 'Low', notes: '' });
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewImages, setViewImages] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const fileInputRef = useRef(null);
  const { setItems: setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    if (version?.project) {
      setBreadcrumb([
        { label: 'Projects', to: '/projects' },
        { label: version.project.name, to: `/projects/${projectId}` },
        { label: version.name, to: null },
      ]);
    }
  }, [version, projectId, setBreadcrumb]);

  useEffect(() => {
    load();
  }, [versionId]);

  useEffect(() => {
    if (projectId) {
      versionService.getByProject(projectId).then(setVersionsList).catch(() => {});
    }
  }, [projectId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await versionService.getById(versionId);
      setVersion(data);
    } catch (e) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const tcs = version?.testCases || [];
  const filteredTcs = useMemo(() => {
    const statusOrder = { Open: 0, Fixed: 1, Verified: 2 }; // unfixed (Open) always on top
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    let list = [...tcs].sort((a, b) => {
      const s = statusOrder[a.status] ?? 0;
      const t = statusOrder[b.status] ?? 0;
      if (s !== t) return s - t; // Open first, then Fixed, then Verified
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2); // then High, Medium, Low
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((tc) => tc.bug?.toLowerCase().includes(q) || tc.test?.toLowerCase().includes(q) || tc.notes?.toLowerCase().includes(q));
    }
    if (filterSeverity) list = list.filter((tc) => tc.severity === filterSeverity);
    if (filterStatus) list = list.filter((tc) => tc.status === filterStatus);
    return list;
  }, [tcs, search, filterSeverity, filterStatus]);

  const openCreate = () => {
    setEditTc(null);
    setForm({ bug: '', test: '', result: '', severity: 'Low', priority: 'Low', notes: '' });
    setPendingFiles([]);
    setShowCreateSheet(true);
  };

  const openEdit = (tc) => {
    setEditTc(tc);
    setForm({
      bug: tc.bug,
      test: tc.test,
      result: tc.result || '',
      severity: tc.severity,
      priority: tc.priority,
      notes: tc.notes || '',
    });
    setPendingFiles([]);
    setDetailTc(null);
    setShowCreateSheet(true);
  };

  const applyTemplate = (key) => {
    const template = getBugTemplate(key);
    if (template) setForm((prev) => ({ ...prev, ...template }));
  };

  const handleSubmitBug = async (e) => {
    e.preventDefault();
    try {
      let savedId = editTc?.id;
      if (editTc) {
        await testCaseService.update(editTc.id, form);
        toast.success('Test case updated');
      } else {
        const created = await testCaseService.create({ versionId: parseInt(versionId), ...form });
        savedId = created?.id;
        toast.success('Test case created');
      }
      if (pendingFiles.length > 0 && savedId) {
        setUploading(true);
        await testCaseService.uploadImages(savedId, pendingFiles);
        toast.success(`${pendingFiles.length} photo(s) uploaded`);
      }
      setShowCreateSheet(false);
      setPendingFiles([]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (tcId, field) => {
    const tc = tcs.find((t) => t.id === tcId);
    if (!tc) return;
    if (field === 'isVerified' && !tc.isFixed) return;
    setTogglingId(tcId);
    const prev = { ...tc, [field]: !tc[field] };
    if (field === 'isFixed' && tc.isVerified) prev.isVerified = false;
    setVersion((v) => ({
      ...v,
      testCases: v.testCases.map((t) => (t.id === tcId ? { ...t, ...prev } : t)),
    }));
    if (detailTc?.id === tcId) setDetailTc((d) => (d ? { ...d, ...prev } : null));
    try {
      await testCaseService.toggle(tcId, field);
    } catch (err) {
      toast.error('Cannot toggle');
      setVersion((v) => ({
        ...v,
        testCases: v.testCases.map((t) => (t.id === tcId ? tc : t)),
      }));
      if (detailTc?.id === tcId) setDetailTc((d) => (d ? { ...d, ...tc } : null));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await testCaseService.remove(deleteId);
      toast.success('Deleted');
      setDeleteId(null);
      if (detailTc?.id === deleteId) setDetailTc(null);
      load();
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handleExport = async () => {
    try {
      await csvService.exportTestCases({ versionId });
      toast.success('CSV exported');
    } catch (e) {
      toast.error('Export failed');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await csvService.importTestCases(parseInt(versionId), file);
      toast.success(res.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    }
    e.target.value = '';
  };

  const handleQuickUpload = async (tcId, files) => {
    if (!files?.length) return;
    try {
      setUploading(true);
      await testCaseService.uploadImages(tcId, Array.from(files));
      toast.success(`${files.length} photo(s) uploaded`);
      load();
      if (detailTc?.id === tcId) setDetailTc((d) => ({ ...d, images: [...(d.images || []), ...files ] }));
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removePendingFile = (idx) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading) return <Loading />;
  if (!version) return <div className="text-center py-12 text-slate-500">Version not found</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mb-6">
      {/* Left: Versions list (desktop only) */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-slate-200/80 bg-white/95 overflow-y-auto">
        <div className="p-3 border-b border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Versions</p>
        </div>
        <nav className="p-2 space-y-0.5">
          {versionsList.map((v) => (
            <Link
              key={v.id}
              to={`/projects/${projectId}/versions/${v.id}`}
              className={`block px-3 py-2 rounded-lg text-sm font-medium truncate ${
                parseInt(v.id) === parseInt(versionId)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {v.name}
            </Link>
          ))}
        </nav>
        <Link
          to={`/projects/${projectId}`}
          className="m-2 mt-auto pt-2 border-t border-slate-100 text-sm text-slate-500 hover:text-primary-600"
        >
          ← Back to project
        </Link>
      </aside>

      {/* Center: Toolbar + content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Back button + Toolbar */}
        <div className="flex flex-col gap-3 p-4 border-b border-slate-200/80 bg-white flex-shrink-0 shadow-sm">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 w-fit -ml-1 py-1.5 touch-manipulation"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to {version?.project?.name || 'project'}</span>
          </Link>
          <input
            type="search"
            placeholder="Search title, test, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input py-2.5 text-sm w-full md:max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input py-2 text-sm flex-1 min-w-0 md:flex-none md:w-auto"
            >
              <option value="">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input py-2 text-sm flex-1 min-w-0 md:flex-none md:w-auto"
            >
              <option value="">All statuses</option>
              <option value="Open">Open</option>
              <option value="Fixed">Fixed</option>
              <option value="Verified">Verified</option>
            </select>
            <div className="hidden md:block flex-1" />
            <button type="button" onClick={openCreate} className="btn btn-primary text-sm w-full md:w-auto order-first md:order-none">
              + Add bug
            </button>
            <button type="button" onClick={handleExport} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm flex-1 md:flex-none">
              Export CSV
            </button>
            <label className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer text-sm flex-1 md:flex-none">
              Import CSV
              <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-0">
          {filteredTcs.length > 0 ? (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden space-y-3 pb-6">
                {filteredTcs.map((tc) => (
                  <div
                    key={tc.id}
                    onClick={() => setDetailTc(tc)}
                    className={`rounded-2xl border bg-white p-4 shadow-sm active:scale-[0.99] transition-transform cursor-pointer touch-manipulation ${
                      detailTc?.id === tc.id ? 'border-primary-300 ring-2 ring-primary-500/20' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800 text-base leading-snug flex-1 min-w-0">
                        {tc.bug}
                      </h3>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(tc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {tc.test && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3" title={tc.test}>
                        {tc.test}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={tc.severity?.toLowerCase()}>{tc.severity}</Badge>
                      <Badge variant={tc.status?.toLowerCase()}>{tc.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={tc.isFixed}
                            onChange={() => handleToggle(tc.id, 'isFixed')}
                            disabled={togglingId === tc.id}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          Fixed
                        </label>
                        <label className="flex items-center gap-1.5 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={tc.isVerified}
                            disabled={!tc.isFixed || togglingId === tc.id}
                            onChange={() => handleToggle(tc.id, 'isVerified')}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Verified
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        {tc.images?.length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setViewImages({ testCaseId: tc.id, images: tc.images, title: tc.bug }); }}
                            className="p-2 rounded-lg text-primary-600 hover:bg-primary-50"
                          >
                            <span className="text-sm font-medium">{tc.images.length}</span> 📷
                          </button>
                        ) : (
                          <label className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleQuickUpload(tc.id, e.target.files)} />
                            + 📷
                          </label>
                        )}
                        <button type="button" onClick={() => openEdit(tc)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Edit">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button type="button" onClick={() => setDeleteId(tc.id)} className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block h-full overflow-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 w-20">Date</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500">Title</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 w-24">Severity</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 w-24">Status</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 w-16">Fixed</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 w-20">Verified</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 w-14">📷</th>
                      <th className="w-20" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredTcs.map((tc) => (
                      <tr
                        key={tc.id}
                        onClick={() => setDetailTc(tc)}
                        className={`cursor-pointer hover:bg-slate-50 ${detailTc?.id === tc.id ? 'bg-primary-50/50' : ''}`}
                      >
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(tc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-900 truncate block max-w-[200px]" title={tc.bug}>
                            {tc.bug}
                          </span>
                          {tc.test && (
                            <span className="text-xs text-slate-500 truncate block max-w-[200px]" title={tc.test}>
                              {tc.test}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={tc.severity?.toLowerCase()}>{tc.severity}</Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={tc.status?.toLowerCase()}>{tc.status}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={tc.isFixed}
                            onChange={(e) => { e.stopPropagation(); handleToggle(tc.id, 'isFixed'); }}
                            disabled={togglingId === tc.id}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={tc.isVerified}
                            disabled={!tc.isFixed || togglingId === tc.id}
                            onChange={(e) => { e.stopPropagation(); handleToggle(tc.id, 'isVerified'); }}
                            className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {tc.images?.length > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setViewImages({ testCaseId: tc.id, images: tc.images, title: tc.bug }); }}
                              className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                            >
                              {tc.images.length}
                            </button>
                          ) : (
                            <label className="cursor-pointer text-slate-300 hover:text-primary-500" onClick={(e) => e.stopPropagation()}>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleQuickUpload(tc.id, e.target.files)} />
                              +
                            </label>
                          )}
                        </td>
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => openEdit(tc)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button type="button" onClick={() => setDeleteId(tc.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 px-4">
              <p className="mb-4 text-sm">No test cases yet.</p>
              <button type="button" onClick={openCreate} className="btn btn-primary">+ Add bug</button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail panel */}
      <Sheet open={!!detailTc} onClose={() => setDetailTc(null)} title={detailTc?.bug} width="max-w-md">
        {detailTc && (
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Test</p>
              <p className="text-sm text-slate-900 whitespace-pre-wrap">{detailTc.test || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Result</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{detailTc.result || '—'}</p>
            </div>
            {detailTc.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{detailTc.notes}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant={detailTc.severity?.toLowerCase()}>{detailTc.severity}</Badge>
              <Badge variant={detailTc.status?.toLowerCase()}>{detailTc.status}</Badge>
              <span className="text-xs text-slate-500">Priority: {detailTc.priority}</span>
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={detailTc.isFixed}
                  onChange={() => handleToggle(detailTc.id, 'isFixed')}
                  disabled={togglingId === detailTc.id}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                Fixed
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={detailTc.isVerified}
                  disabled={!detailTc.isFixed || togglingId === detailTc.id}
                  onChange={() => handleToggle(detailTc.id, 'isVerified')}
                  className="w-4 h-4 rounded border-slate-300 text-green-600"
                />
                Verified
              </label>
            </div>
            <p className="text-xs text-slate-400">Created {new Date(detailTc.createdAt).toLocaleString()}</p>
            {detailTc.images?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Screenshots</p>
                <div className="flex flex-wrap gap-2">
                  {detailTc.images.map((img) => (
                    <a
                      key={img.id}
                      href={`${API_BASE}/uploads/${img.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-20 h-20 rounded-lg border border-slate-200 overflow-hidden"
                    >
                      <img src={`${API_BASE}/uploads/${img.filePath}`} alt={img.originalName} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <button type="button" onClick={() => openEdit(detailTc)} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 w-full">
              Edit
            </button>
          </div>
        )}
      </Sheet>

      {/* Create / Edit Bug Sheet */}
      <Sheet
        open={showCreateSheet}
        onClose={() => { setShowCreateSheet(false); setPendingFiles([]); }}
        title={editTc ? 'Edit test case' : 'New test case'}
        width="max-w-lg"
      >
        <form onSubmit={handleSubmitBug} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div>
              <label className="label">Template</label>
              <select
                className="select text-sm"
                onChange={(e) => applyTemplate(e.target.value)}
              >
                {BUG_TEMPLATES.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Basic</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Bug / Category *</label>
                  <input
                    type="text"
                    required
                    value={form.bug}
                    onChange={(e) => setForm((f) => ({ ...f, bug: e.target.value }))}
                    className="input"
                    placeholder="e.g. Login, Cart"
                  />
                </div>
                <div>
                  <label className="label">Test description *</label>
                  <textarea
                    required
                    value={form.test}
                    onChange={(e) => setForm((f) => ({ ...f, test: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="What do you test?"
                  />
                </div>
                <div>
                  <label className="label">Result</label>
                  <textarea
                    value={form.result}
                    onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder="Actual result (after testing)"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Environment</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Severity</label>
                  <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))} className="select">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="select">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="label">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="input"
                  rows={2}
                  placeholder="Extra notes"
                />
              </div>
            </section>

            <section>
              <label className="label">Photos / Screenshots</label>
              {editTc?.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTc.images.map((img) => (
                    <img
                      key={img.id}
                      src={`${API_BASE}/uploads/${img.filePath}`}
                      alt={img.originalName}
                      className="w-14 h-14 object-cover rounded border border-slate-200"
                    />
                  ))}
                </div>
              )}
              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {pendingFiles.map((f, idx) => (
                    <div key={idx} className="relative">
                      <img src={URL.createObjectURL(f)} alt="" className="w-14 h-14 object-cover rounded border border-primary-200" />
                      <button type="button" onClick={() => removePendingFile(idx)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs">×</button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 text-sm text-slate-500">
                <span>+ Add photos</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && setPendingFiles((p) => [...p, ...Array.from(e.target.files)])}
                />
              </label>
            </section>
          </div>
          <div className="flex gap-3 p-4 sm:p-6 border-t border-slate-100 flex-shrink-0">
            <button type="submit" disabled={uploading} className="btn btn-primary flex-1">
              {uploading ? 'Saving…' : editTc ? 'Save' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowCreateSheet(false); setPendingFiles([]); }} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Sheet>

      {/* Image gallery modal */}
      {viewImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setViewImages(null)}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-2xl w-full max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Photos — {viewImages.title}</h2>
              <button type="button" onClick={() => setViewImages(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">×</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {viewImages.images.map((img) => (
                <img
                  key={img.id}
                  src={`${API_BASE}/uploads/${img.filePath}`}
                  alt={img.originalName}
                  className="w-full h-40 object-cover rounded-lg cursor-pointer border border-slate-200"
                  onClick={() => setLightboxImg(`${API_BASE}/uploads/${img.filePath}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {lightboxImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={() => setLightboxImg(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">×</button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete test case"
        message="Are you sure you want to delete this test case?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
