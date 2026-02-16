import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { getApiErrorMessage } from '../services/api';
import { useLang } from '../context/LangContext';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [removeMemberId, setRemoveMemberId] = useState(null);
  const [showFinishedProjects, setShowFinishedProjects] = useState(false);
  const [endProjectId, setEndProjectId] = useState(null);
  const [reopenProjectId, setReopenProjectId] = useState(null);
  const { t } = useLang();
  const { setItems: setBreadcrumb } = useBreadcrumb();
  const hasShownLoadError = useRef(false);

  const activeProjects = projects.filter(p => p.status !== 'finished');
  const finishedProjects = projects.filter(p => p.status === 'finished');

  useEffect(() => {
    setBreadcrumb([{ label: t('projects.title'), to: null }]);
  }, [setBreadcrumb, t]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      hasShownLoadError.current = false;
      const data = await projectService.getAll();
      setProjects(data);
    } catch (e) {
      setLoadError(getApiErrorMessage(e));
      if (!hasShownLoadError.current) {
        hasShownLoadError.current = true;
        toast.error(getApiErrorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ name: p.name, description: p.description || '' });
    setMemberEmail('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await projectService.update(editProject.id, form);
        toast.success('Project updated');
      } else {
        await projectService.create(form);
        toast.success('Project created');
      }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await projectService.remove(deleteId);
      toast.success('Project deleted');
      setDeleteId(null);
      load();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleEndProject = async () => {
    try {
      await projectService.update(endProjectId, { status: 'finished' });
      toast.success('Project marked as finished');
      setEndProjectId(null);
      load();
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleReopenProject = async () => {
    try {
      await projectService.update(reopenProjectId, { status: 'active' });
      toast.success('Project reopened');
      setReopenProjectId(null);
      load();
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleAddMember = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      await projectService.addMember(editProject.id, memberEmail);
      toast.success(t('members.memberAdded'));
      setMemberEmail('');
      const updated = await projectService.getById(editProject.id);
      setEditProject(updated);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed';
      if (msg.includes('not registered')) toast.error(t('members.userNotRegistered'));
      else if (msg.includes('already a member')) toast.error(t('members.alreadyMember'));
      else if (msg.includes('already the owner')) toast.error(t('members.alreadyOwner'));
      else toast.error(msg);
    }
  };

  const handleRemoveMember = async () => {
    try {
      await projectService.removeMember(editProject.id, removeMemberId);
      toast.success(t('members.memberRemoved'));
      setRemoveMemberId(null);
      const updated = await projectService.getById(editProject.id);
      setEditProject(updated);
      load();
    } catch (e) { toast.error('Failed to remove member'); }
  };

  const isOwner = (p) => p?.createdById === JSON.parse(localStorage.getItem('user'))?.id;

  if (loading) return <Loading />;

  return (
    <div className="pl-6 pr-6 sm:pl-8 sm:pr-8">
      {/* Hero / header – theme from logo (sky primary) */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary-50 via-white to-primary-50/50 border border-primary-100/80 p-6 sm:p-8 mb-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200/20 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{t('projects.title')}</h1>
              <p className="text-slate-600 mt-1 max-w-xl">
                {t('projects.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-primary flex-shrink-0 inline-flex items-center justify-center gap-2 shadow-md shadow-primary-600/25 hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>{t('projects.createProject')}</span>
          </button>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-8">
          {/* Active projects – staggered fade-in, hover lift */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t('projects.yourProjects')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeProjects.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-primary-200/90 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Link to={`/projects/${p.id}`} className="flex-1 min-w-0 group">
                      <span className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 truncate block transition-colors">{p.name}</span>
                    </Link>
                  </div>
                  {p.description && <p className="text-sm text-slate-600 mb-4 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {p._count?.versions || 0} {(p._count?.versions || 0) === 1 ? t('projects.versionCount') : t('projects.versionCountPlural')}
                    </span>
                    <span>{p.createdBy?.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                    <Link
                      to={`/projects/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-100 transition-colors"
                    >
                      <span>{t('projects.openProject')}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                    <span className="flex-1 min-w-0" />
                    <button type="button" onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors" title={t('projects.settings')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    <button type="button" onClick={() => setEndProjectId(p.id)} className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors" title={t('projects.endProject')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button type="button" onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors" title={t('projects.deleteProject')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Finished projects – collapsible */}
          {finishedProjects.length > 0 && (
            <section className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowFinishedProjects(!showFinishedProjects)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  {t('projects.finishedProjects')} ({finishedProjects.length})
                </span>
                <span className="flex-shrink-0 ml-2 text-slate-400 transition-transform duration-200" style={{ transform: showFinishedProjects ? 'rotate(180deg)' : 'none' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              {showFinishedProjects && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {finishedProjects.map(p => (
                      <div key={p.id} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-200">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <Link to={`/projects/${p.id}`} className="text-base font-semibold text-slate-800 hover:text-primary-600 truncate flex-1">{p.name}</Link>
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-lg bg-slate-200 text-slate-600 font-medium">{t('projectDetail.finished')}</span>
                        </div>
                        {p.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{p.description}</p>}
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                          <span>{p._count?.versions || 0} version(s)</span>
                          <span>{p.createdBy?.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                          <Link to={`/projects/${p.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">Open</Link>
                          <span className="flex-1" />
                          <button type="button" onClick={() => setReopenProjectId(p.id)} className="text-sm font-medium text-primary-600 hover:text-primary-700">{t('projectDetail.reopenProject')}</button>
                          <button type="button" onClick={() => openEdit(p)} className="text-sm text-slate-500 hover:text-slate-700">{t('projects.settings')}</button>
                          <button type="button" onClick={() => setDeleteId(p.id)} className="text-sm text-red-500 hover:text-red-700">{t('common.delete')}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-sm">
          <p className="text-slate-600 mb-2">{loadError}</p>
          <p className="text-sm text-slate-500 mb-4">Check that the server is running, then try again.</p>
          <button type="button" onClick={() => load()} className="btn btn-primary">Try again</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 sm:p-16 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h2>
          <p className="text-slate-600 mb-6 max-w-sm mx-auto">Create your first project to start organizing versions and test cases. One click and you’re ready to go.</p>
          <button type="button" onClick={openCreate} className="btn btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('projects.createProject')}
          </button>
        </div>
      )}

      {/* Create/Edit modal – backdrop blur, scale-in */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="animate-modal-in bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-4 sm:my-8" style={{ maxWidth: 'min(28rem, calc(100vw - 1.5rem))' }}>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{editProject ? t('projects.editProject') : t('projects.newProject')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.projectNameLabel')}</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input w-full" placeholder={t('projects.projectNamePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('projects.descriptionLabel')}</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input w-full" rows={3} placeholder={t('projects.projectDescriptionPlaceholder')} />
              </div>
              {/* Members section (only show if editing and owner) */}
              {editProject && isOwner(editProject) && (
                <div className="border-t border-slate-200 pt-5 mt-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">{t('members.title')}</h3>
                  <div className="flex gap-2 mb-4">
                    <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(e); } }}
                      className="input flex-1 text-sm" placeholder={t('members.email')} />
                    <button type="button" onClick={() => handleAddMember({ preventDefault: () => {} })} className="btn bg-primary-50 text-primary-600 hover:bg-primary-100 text-sm px-3 shrink-0">{t('members.addButton')}</button>
                  </div>
                  {editProject.members && editProject.members.length > 0 ? (
                    <div className="space-y-2">
                      {editProject.members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-800 truncate">{m.user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{m.user.email}</p>
                          </div>
                          <button type="button" onClick={() => setRemoveMemberId(m.id)} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 px-2 rounded-lg shrink-0">{t('members.removeMember')}</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 py-3">{t('members.noMembers')}</p>
                  )}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editProject ? t('common.save') : t('projects.createButton')}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title={t('projects.deleteProject')} message={t('projects.deleteProjectConfirm')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      <ConfirmDialog open={!!removeMemberId} title={t('members.removeMember')} message={t('members.removeMemberConfirm')} onConfirm={handleRemoveMember} onCancel={() => setRemoveMemberId(null)} />
      <ConfirmDialog open={!!endProjectId} title={t('projects.endProject')} message={t('projects.endProjectConfirm')} confirmLabel={t('projects.endConfirmLabel')} onConfirm={handleEndProject} onCancel={() => setEndProjectId(null)} />
      <ConfirmDialog open={!!reopenProjectId} title={t('projects.reopenProjectTitle')} message={t('projects.reopenProjectMessage')} confirmLabel={t('projects.reopenConfirmLabel')} onConfirm={handleReopenProject} onCancel={() => setReopenProjectId(null)} />
    </div>
  );
};

export default ProjectsPage;
