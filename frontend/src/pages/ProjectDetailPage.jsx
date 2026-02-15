import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { versionService } from '../services/versionService';
import { useLang } from '../context/LangContext';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { SectionHeader } from '../components/ui';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVersion, setEditVersion] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [removeMemberId, setRemoveMemberId] = useState(null);
  const [membersExpanded, setMembersExpanded] = useState(false); // mobile: collapse by default
  const [previousVersionsExpanded, setPreviousVersionsExpanded] = useState(false); // older versions collapsed by default (desktop + mobile)
  const [reopenProjectConfirm, setReopenProjectConfirm] = useState(false);
  const [endProjectConfirm, setEndProjectConfirm] = useState(false);
  const { t } = useLang();

  // New version allowed only when all bugs in all versions are Verified (Fixed + Verified checkbox)
  const hasUnverifiedBugs = (version) => (version.testCases || []).some(tc => tc.status !== 'Verified');
  const versions = project?.versions || [];
  const latestVersion = versions.length > 0 ? versions[0] : null;
  const previousVersions = versions.length > 1 ? versions.slice(1) : [];
  const canAddNewVersion = versions.length === 0 || !versions.some(hasUnverifiedBugs);
  const { setItems: setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    if (project) {
      setBreadcrumb([
        { label: t('nav.projects'), to: '/projects' },
        { label: project.name, to: null },
      ]);
    }
  }, [project, setBreadcrumb, t]);
  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(id);
      setProject(data);
    } catch (e) { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    if (!canAddNewVersion) {
      toast.error('Fix and verify all bugs in existing versions before adding a new version.');
      return;
    }
    setEditVersion(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditVersion(v);
    setForm({ name: v.name, description: v.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editVersion) {
        await versionService.update(editVersion.id, form);
        toast.success('Version updated');
      } else {
        await versionService.create({ projectId: parseInt(id), ...form });
        toast.success('Version created');
      }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await versionService.remove(deleteId);
      toast.success('Version deleted');
      setDeleteId(null);
      load();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleReopenProject = async () => {
    try {
      await projectService.update(id, { status: 'active' });
      toast.success('Project reopened');
      setReopenProjectConfirm(false);
      load();
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleEndProject = async () => {
    try {
      await projectService.update(id, { status: 'finished' });
      toast.success('Project marked as finished');
      setEndProjectConfirm(false);
      load();
    } catch (e) { toast.error('Failed to update'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectService.addMember(id, memberEmail);
      toast.success(t('members.memberAdded'));
      setMemberEmail('');
      setShowMemberForm(false);
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
      await projectService.removeMember(id, removeMemberId);
      toast.success(t('members.memberRemoved'));
      setRemoveMemberId(null);
      load();
    } catch (e) { toast.error('Failed to remove member'); }
  };

  const isOwner = project?.createdById === JSON.parse(localStorage.getItem('user'))?.id;

  if (loading) return <Loading />;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 w-fit -ml-1 py-1.5 mb-2 touch-manipulation"
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>{t('projectDetail.backToProjects')}</span>
      </Link>
      <SectionHeader
        title={
          <span className="inline-flex items-center gap-2">
            {project.name}
            {project.status === 'finished' && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-200 text-slate-600 border border-slate-300">{t('projectDetail.finished')}</span>
            )}
          </span>
        }
        description={project.description || undefined}
        action={
          project.status === 'finished' ? (
            <button type="button" onClick={() => setReopenProjectConfirm(true)} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 w-full sm:w-auto">
              {t('projectDetail.reopenProject')}
            </button>
          ) : (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button type="button" onClick={() => setEndProjectConfirm(true)} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200">
                {t('projectDetail.endProject')}
              </button>
              <button
                type="button"
                onClick={openCreate}
                className={`btn flex-1 sm:flex-none ${canAddNewVersion ? 'btn-primary' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                disabled={!canAddNewVersion}
                title={!canAddNewVersion ? t('projectDetail.fixAllBugsFirst') : undefined}
              >
                + {t('projectDetail.newVersion')}
              </button>
            </div>
          )
        }
      />

      {/* Versions: latest visible; previous versions in collapsible (desktop + mobile) */}
      {versions.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">{t('projectDetail.versions')}</h2>
          {/* Latest version always visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div key={latestVersion.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-primary-200/80 transition-all">
              <Link to={`/projects/${id}/versions/${latestVersion.id}`} className="text-base font-semibold text-slate-800 hover:text-primary-600 block">
                {latestVersion.name}
              </Link>
              {latestVersion.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{latestVersion.description}</p>}
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 sm:mt-3">
                <span>{latestVersion._count?.testCases || 0} {t('projects.testCaseCount')}</span>
                {hasUnverifiedBugs(latestVersion) && <span className="text-amber-600">{t('projectDetail.notAllVerified')}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100">
                <Link to={`/projects/${id}/versions/${latestVersion.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">{t('projects.openVersionLink')}</Link>
                <span className="flex-1" />
                <button type="button" onClick={() => openEdit(latestVersion)} className="text-sm text-slate-500 hover:text-slate-700 py-1">{t('common.edit')}</button>
                <button type="button" onClick={() => setDeleteId(latestVersion.id)} className="text-sm text-red-500 hover:text-red-700 py-1">{t('common.delete')}</button>
              </div>
            </div>
          </div>
          {/* Previous versions: collapsible (desktop + mobile) */}
          {previousVersions.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setPreviousVersionsExpanded(!previousVersionsExpanded)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-colors"
              >
                <h3 className="text-sm font-semibold text-slate-700">
                  {t('projectDetail.previousVersions')} ({previousVersions.length})
                </h3>
                <span className="flex-shrink-0 ml-2 text-slate-400">
                  {previousVersionsExpanded ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  )}
                </span>
              </button>
              {previousVersionsExpanded && (
                <div className="border-t border-slate-100 p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {previousVersions.map(v => (
                      <div key={v.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-primary-200/80 transition-all">
                        <Link to={`/projects/${id}/versions/${v.id}`} className="text-base font-semibold text-slate-800 hover:text-primary-600 block">
                          {v.name}
                        </Link>
                        {v.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{v.description}</p>}
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 sm:mt-3">
                          <span>{v._count?.testCases || 0} {t('projects.testCaseCount')}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100">
                          <Link to={`/projects/${id}/versions/${v.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">{t('projects.openVersionLink')}</Link>
                          <span className="flex-1" />
                          <button type="button" onClick={() => openEdit(v)} className="text-sm text-slate-500 hover:text-slate-700 py-1">{t('common.edit')}</button>
                          <button type="button" onClick={() => setDeleteId(v.id)} className="text-sm text-red-500 hover:text-red-700 py-1">{t('common.delete')}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-12 text-center shadow-sm">
          <p className="text-slate-500 mb-4">{t('projects.noVersionsYetCreate')}</p>
          <button type="button" onClick={openCreate} className="btn btn-primary">+ {t('projectDetail.newVersion')}</button>
        </div>
      )}

      {/* Members: collapsible on mobile, compact list */}
      {isOwner && (
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setMembersExpanded(!membersExpanded)}
            className="w-full flex items-center justify-between p-4 text-left sm:pointer-events-none sm:cursor-default"
          >
            <h2 className="text-base font-semibold text-slate-800">
              {t('members.title')} {project.members?.length ? `(${project.members.length})` : ''}
            </h2>
            <span className="sm:hidden flex-shrink-0 ml-2 text-slate-400">
              {membersExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              )}
            </span>
          </button>
          <div className={`border-t border-slate-200/80 ${membersExpanded ? 'block' : 'hidden sm:block'}`}>
            <div className="p-4 pt-4">
              <button type="button" onClick={() => setShowMemberForm(true)} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm w-full sm:w-auto inline-flex items-center gap-2 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t('members.addMember')}
              </button>
              {project.members && project.members.length > 0 ? (
                <div className="space-y-1 max-h-[280px] sm:max-h-none overflow-y-auto">
                  {project.members.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                        {(m.user.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 text-sm truncate">{m.user.name}</p>
                        <p className="text-xs text-slate-500 truncate" title={m.user.email}>{m.user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRemoveMemberId(m.id)}
                        className="flex-shrink-0 text-xs font-medium text-red-500 hover:text-red-700 py-2 px-2 rounded-lg hover:bg-red-50 touch-manipulation"
                      >
                        {t('members.removeMember')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-2">{t('members.noMembers')}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-4 sm:my-8" style={{ maxWidth: 'min(28rem, calc(100vw - 1.5rem))' }}>
            <h2 className="text-lg font-semibold mb-4">{editVersion ? t('projectDetail.editVersion') : t('projectDetail.newVersion')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input w-full" placeholder={t('projectDetail.versionNamePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input w-full" rows={3} placeholder={t('projectDetail.versionDescriptionPlaceholder')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editVersion ? 'Save' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6" style={{ maxWidth: 'min(28rem, calc(100vw - 1.5rem))' }}>
            <h2 className="text-lg font-semibold mb-4">{t('members.inviteByEmail')}</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('members.email')} *</label>
                <input type="email" required value={memberEmail} onChange={e => setMemberEmail(e.target.value)}
                  className="input w-full" placeholder={t('projectDetail.memberEmailPlaceholder')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{t('members.addButton')}</button>
                <button type="button" onClick={() => { setShowMemberForm(false); setMemberEmail(''); }} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title={t('projectDetail.deleteVersion')} message={t('projectDetail.deleteVersionConfirm')} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      <ConfirmDialog open={!!removeMemberId} title={t('members.removeMember')} message={t('members.removeMemberConfirm')} onConfirm={handleRemoveMember} onCancel={() => setRemoveMemberId(null)} />
      <ConfirmDialog open={reopenProjectConfirm} title={t('projects.reopenProjectTitle')} message={t('projects.reopenProjectMessage')} confirmLabel={t('projects.reopenConfirmLabel')} onConfirm={handleReopenProject} onCancel={() => setReopenProjectConfirm(false)} />
      <ConfirmDialog open={endProjectConfirm} title={t('projects.endProject')} message={t('projectDetail.endProjectConfirm')} confirmLabel={t('projectDetail.endConfirmLabel')} onConfirm={handleEndProject} onCancel={() => setEndProjectConfirm(false)} />
    </div>
  );
};

export default ProjectDetailPage;
