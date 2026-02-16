import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { versionService } from '../services/versionService';
import { testCaseService } from '../services/testCaseService';
import { csvService } from '../services/csvService';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { useLang } from '../context/LangContext';
import { Badge, Sheet } from '../components/ui';
import { BUG_TEMPLATES, getBugTemplate } from '../utils/bugTemplates';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectVersionSidebar from '../components/ProjectVersionSidebar';
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
  const [deleteImageInfo, setDeleteImageInfo] = useState(null);
  const [viewImages, setViewImages] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const fileInputRef = useRef(null);
  const { setItems: setBreadcrumb } = useBreadcrumb();
  const { t } = useLang();

  useEffect(() => {
    if (version?.project) {
      setBreadcrumb([
        { label: t('nav.projects'), to: '/projects' },
        { label: version.project.name, to: `/projects/${projectId}` },
        { label: version.name, to: null },
      ]);
    }
  }, [version, projectId, setBreadcrumb, t]);

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

  const handleDeleteImage = async () => {
    if (!deleteImageInfo) return;
    const { imageId, testCaseId } = deleteImageInfo;
    try {
      await testCaseService.deleteImage(imageId);
      toast.success('Deleted');
      setDeleteImageInfo(null);
      if (viewImages?.testCaseId === testCaseId) {
        setViewImages(prev => {
          const nextImages = prev.images.filter(img => img.id !== imageId);
          if (nextImages.length === 0) return null;
          return { ...prev, images: nextImages };
        });
      }
      if (detailTc?.id === testCaseId) {
        setDetailTc(prev => ({ ...prev, images: prev.images.filter(img => img.id !== imageId) }));
      }
      if (editTc?.id === testCaseId) {
        setEditTc(prev => ({ ...prev, images: prev.images.filter(img => img.id !== imageId) }));
      }
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
    <div className="flex min-h-[calc(100vh-3.5rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mb-6">
      <ProjectVersionSidebar projectId={projectId} versions={versionsList} currentVersionId={parseInt(versionId)} />

      {/* Center: Toolbar + content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 bg-white pl-6 pr-6 sm:pl-8 sm:pr-8">
        {/* Back + Toolbar — redesigned */}
        <div className="flex flex-col gap-4 p-4 sm:p-5 border-b border-slate-200/80 bg-white flex-shrink-0 shadow-sm">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 w-fit rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-100/80 active:bg-slate-200/80 transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t('versionDetail.backToProjectBefore')}{version?.project?.name || 'project'}{t('versionDetail.backToProjectAfter')}</span>
          </Link>

          {/* Search — icon + input */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="search"
              placeholder={t('versionDetail.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400 focus:bg-white transition-colors md:max-w-sm"
            />
          </div>

          {/* Filters + actions row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2 flex-1 min-w-0">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className={`min-w-0 py-2 pl-3 pr-8 text-sm rounded-xl border bg-white font-medium transition-colors appearance-none cursor-pointer bg-no-repeat bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400 ${filterSeverity ? 'border-primary-300 text-primary-700 bg-primary-50/50' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
              >
                <option value="">{t('versionDetail.allSeverities')}</option>
                <option value="Critical">{t('severity.Critical')}</option>
                <option value="High">{t('severity.High')}</option>
                <option value="Medium">{t('severity.Medium')}</option>
                <option value="Low">{t('severity.Low')}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`min-w-0 py-2 pl-3 pr-8 text-sm rounded-xl border bg-white font-medium transition-colors appearance-none cursor-pointer bg-no-repeat bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400 ${filterStatus ? 'border-primary-300 text-primary-700 bg-primary-50/50' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
              >
                <option value="">{t('versionDetail.allStatuses')}</option>
                <option value="Open">{t('status.Open')}</option>
                <option value="Fixed">{t('status.Fixed')}</option>
                <option value="Verified">{t('status.Verified')}</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2 flex-shrink-0">
              <button type="button" onClick={openCreate} className="btn btn-primary text-sm inline-flex items-center gap-1.5 px-4 py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t('versionDetail.addBug')}
              </button>
              <button type="button" onClick={handleExport} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {t('csv.export')}
              </button>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {t('csv.import')}
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-4">
          {filteredTcs.length > 0 ? (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden space-y-3 pb-6">
                {filteredTcs.map((tc) => (
                  <div
                    key={tc.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm transition-colors ${
                      detailTc?.id === tc.id ? 'border-primary-300 ring-2 ring-primary-500/20' : 'border-slate-200/80'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setDetailTc(tc)}
                      className="w-full text-left rounded-lg -m-1 p-1 hover:bg-slate-50/80 active:scale-[0.99] transition-all cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary-500/30"
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
                    </button>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={tc.severity?.toLowerCase()}>{t('severity.' + tc.severity) ?? tc.severity}</Badge>
                      <Badge variant={tc.status?.toLowerCase()}>{t('status.' + tc.status) ?? tc.status}</Badge>
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
                          {t('status.Fixed')}
                        </label>
                        <label className="flex items-center gap-1.5 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={tc.isVerified}
                            disabled={!tc.isFixed || togglingId === tc.id}
                            onChange={() => handleToggle(tc.id, 'isVerified')}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          {t('status.Verified')}
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
                        <button type="button" onClick={() => openEdit(tc)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label={t('versionDetail.edit')}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button type="button" onClick={() => setDeleteId(tc.id)} className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={t('versionDetail.delete')}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table – card so it stands out on white page */}
              <div className="hidden md:block h-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 w-20">{t('versionDetail.date')}</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500">{t('testCase.title')}</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 w-24">{t('testRun.severity')}</th>
                      <th className="text-left py-2.5 px-3 font-medium text-slate-500 w-24">{t('testRun.status')}</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 whitespace-nowrap min-w-[5rem]">{t('status.Fixed')}</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 whitespace-nowrap min-w-[5rem]">{t('status.Verified')}</th>
                      <th className="text-center py-2.5 px-3 font-medium text-slate-500 w-14">📷</th>
                      <th className="w-20" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredTcs.map((tc) => (
                      <tr
                        key={tc.id}
                        className={detailTc?.id === tc.id ? 'bg-primary-50/50' : ''}
                      >
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(tc.createdAt).toLocaleDateString()}
                        </td>
                        <td
                          className="py-2.5 px-3 cursor-pointer hover:bg-slate-50/80 rounded"
                          onClick={() => setDetailTc(tc)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailTc(tc); } }}
                        >
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
                          <Badge variant={tc.severity?.toLowerCase()}>{t('severity.' + tc.severity) ?? tc.severity}</Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={tc.status?.toLowerCase()}>{t('status.' + tc.status) ?? tc.status}</Badge>
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
                            <button type="button" onClick={() => openEdit(tc)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded" title={t('versionDetail.edit')}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button type="button" onClick={() => setDeleteId(tc.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded" title={t('versionDetail.delete')}>
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
              <p className="mb-4 text-sm">{t('versionDetail.noTestCasesYet')}</p>
              <button type="button" onClick={openCreate} className="btn btn-primary">+ {t('versionDetail.addBug')}</button>
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
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{t('versionDetail.result')}</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{detailTc.result || '—'}</p>
            </div>
            {detailTc.notes && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{t('versionDetail.notes')}</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{detailTc.notes}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant={detailTc.severity?.toLowerCase()}>{t('severity.' + detailTc.severity) || detailTc.severity}</Badge>
              <Badge variant={detailTc.status?.toLowerCase()}>{t('status.' + detailTc.status) || detailTc.status}</Badge>
              <span className="text-xs text-slate-500">{t('versionDetail.priority')}: {t('priority.' + detailTc.priority) || detailTc.priority}</span>
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
                {t('status.Fixed')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={detailTc.isVerified}
                  disabled={!detailTc.isFixed || togglingId === detailTc.id}
                  onChange={() => handleToggle(detailTc.id, 'isVerified')}
                  className="w-4 h-4 rounded border-slate-300 text-green-600"
                />
                {t('status.Verified')}
              </label>
            </div>
            <p className="text-xs text-slate-400">{t('versionDetail.created')} {new Date(detailTc.createdAt).toLocaleString()}</p>
            {detailTc.images?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">{t('versionDetail.screenshots')}</p>
                <div className="flex flex-wrap gap-2">
                  {detailTc.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <a
                        href={`${API_BASE}/uploads/${img.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-20 h-20 rounded-lg border border-slate-200 overflow-hidden"
                      >
                        <img src={`${API_BASE}/uploads/${img.filePath}`} alt={img.originalName} className="w-full h-full object-cover" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteImageInfo({ imageId: img.id, testCaseId: detailTc.id })}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity shadow"
                        title={t('versionDetail.delete')}
                        aria-label={t('versionDetail.delete')}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button type="button" onClick={() => openEdit(detailTc)} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 w-full">
              {t('versionDetail.edit')}
            </button>
          </div>
        )}
      </Sheet>

      {/* Create / Edit Test Case Sheet */}
      <Sheet
        open={showCreateSheet}
        onClose={() => { setShowCreateSheet(false); setPendingFiles([]); }}
        title={editTc ? t('versionDetail.editTestCase') : t('versionDetail.newTestCase')}
        width="max-w-lg"
      >
        <form onSubmit={handleSubmitBug} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div>
              <label className="label">{t('versionDetail.template')}</label>
              <select
                className="select text-sm"
                onChange={(e) => applyTemplate(e.target.value)}
              >
                {BUG_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.key} value={tmpl.key}>{t('templates.' + tmpl.key)}</option>
                ))}
              </select>
            </div>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{t('versionDetail.basic')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">{t('versionDetail.bugCategory')}</label>
                  <input
                    type="text"
                    required
                    value={form.bug}
                    onChange={(e) => setForm((f) => ({ ...f, bug: e.target.value }))}
                    className="input"
                    placeholder={t('versionDetail.bugCategoryPlaceholder')}
                  />
                </div>
                <div>
                  <label className="label">{t('versionDetail.testDescription')}</label>
                  <textarea
                    required
                    value={form.test}
                    onChange={(e) => setForm((f) => ({ ...f, test: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder={t('versionDetail.testDescriptionPlaceholder')}
                  />
                </div>
                <div>
                  <label className="label">{t('versionDetail.result')}</label>
                  <textarea
                    value={form.result}
                    onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                    className="input"
                    rows={2}
                    placeholder={t('versionDetail.resultPlaceholder')}
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{t('versionDetail.environment')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t('testRun.severity')}</label>
                  <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))} className="select">
                    <option value="Critical">{t('severity.Critical')}</option>
                    <option value="High">{t('severity.High')}</option>
                    <option value="Medium">{t('severity.Medium')}</option>
                    <option value="Low">{t('severity.Low')}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{t('versionDetail.priority')}</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="select">
                    <option value="High">{t('priority.High')}</option>
                    <option value="Medium">{t('priority.Medium')}</option>
                    <option value="Low">{t('priority.Low')}</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="label">{t('versionDetail.notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="input"
                  rows={2}
                  placeholder={t('versionDetail.notesPlaceholder')}
                />
              </div>
            </section>

            <section>
              <label className="label">{t('versionDetail.photosScreenshots')}</label>
              {editTc?.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTc.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={`${API_BASE}/uploads/${img.filePath}`}
                        alt={img.originalName}
                        className="w-14 h-14 object-cover rounded border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setDeleteImageInfo({ imageId: img.id, testCaseId: editTc.id })}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity shadow"
                        title={t('versionDetail.delete')}
                        aria-label={t('versionDetail.delete')}
                      >
                        ×
                      </button>
                    </div>
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
                <span>+ {t('versionDetail.addPhotos')}</span>
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
              <h2 className="font-semibold text-slate-900">{t('versionDetail.photosTitle')} {viewImages.title}</h2>
              <button type="button" onClick={() => setViewImages(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">×</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {viewImages.images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={`${API_BASE}/uploads/${img.filePath}`}
                    alt={img.originalName}
                    className="w-full h-40 object-cover rounded-lg cursor-pointer border border-slate-200"
                    onClick={() => setLightboxImg(`${API_BASE}/uploads/${img.filePath}`)}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeleteImageInfo({ imageId: img.id, testCaseId: viewImages.testCaseId }); }}
                    className="absolute top-1 right-1 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity shadow"
                    title={t('versionDetail.delete')}
                    aria-label={t('versionDetail.delete')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {lightboxImg && (() => {
        const list = viewImages?.images ?? [];
        const currentIndex = list.findIndex((img) => `${API_BASE}/uploads/${img.filePath}` === lightboxImg);
        const hasMultiple = list.length > 1;
        const goPrev = () => {
          const prevIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
          setLightboxImg(`${API_BASE}/uploads/${list[prevIndex].filePath}`);
        };
        const goNext = () => {
          const nextIndex = currentIndex >= list.length - 1 ? 0 : currentIndex + 1;
          setLightboxImg(`${API_BASE}/uploads/${list[nextIndex].filePath}`);
        };
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 p-4" onClick={() => setLightboxImg(null)}>
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
            <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors z-10">×</button>
          </div>
        );
      })()}

      <ConfirmDialog
        open={!!deleteId}
        title={t('versionDetail.deleteTestCaseTitle')}
        message={t('versionDetail.deleteTestCaseConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
      <ConfirmDialog
        open={!!deleteImageInfo}
        title={t('versionDetail.deletePhotoTitle')}
        message={t('versionDetail.deletePhotoConfirm')}
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteImageInfo(null)}
      />
    </div>
  );
}
