import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { projectService } from '../services/projectService';
import { versionService } from '../services/versionService';

const SIDEBAR_CLASS = 'hidden lg:block lg:w-64 lg:fixed lg:h-[calc(100vh-3.5rem)] lg:top-14 lg:overflow-y-auto bg-white border-r border-slate-200/80 shadow-sm';

function Chevron({ open, className = 'w-4 h-4' }) {
  return (
    <svg className={`${className} flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function FolderIcon({ open, className = 'w-4 h-4' }) {
  return (
    <svg className={`${className} flex-shrink-0 ${open ? 'text-primary-500' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function VersionIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={`${className} flex-shrink-0 text-slate-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

/**
 * Left sidebar: tree of projects (expandable), with versions as children. No section headings.
 */
export default function ProjectVersionSidebar({
  projects: projectsProp,
  versions: versionsProp,
  projectId: projectIdProp,
  currentVersionId: currentVersionIdProp,
}) {
  const { t } = useLang();
  const params = useParams();
  const projectId = projectIdProp != null ? parseInt(projectIdProp) : (params.id ? parseInt(params.id) : null);
  const versionIdFromRoute = params.versionId ? parseInt(params.versionId) : null;
  const activeVersionId = currentVersionIdProp != null ? currentVersionIdProp : versionIdFromRoute;

  const [projects, setProjects] = useState(projectsProp || []);
  const [versionsByProject, setVersionsByProject] = useState({});
  const [expandedIds, setExpandedIds] = useState(() => (projectId ? new Set([projectId]) : new Set()));
  const [loadingProjects, setLoadingProjects] = useState(!projectsProp);
  const [loadingProjectId, setLoadingProjectId] = useState(null);

  const activeProjects = projects.filter((p) => p.status !== 'finished');

  const toggleExpanded = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Load projects when not provided
  useEffect(() => {
    if (projectsProp != null) {
      setProjects(projectsProp);
      return;
    }
    let cancelled = false;
    projectService.getAll().then((data) => { if (!cancelled) setProjects(data || []); }).catch(() => { if (!cancelled) setProjects([]); }).finally(() => { if (!cancelled) setLoadingProjects(false); });
    return () => { cancelled = true; };
  }, [projectsProp]);

  // Sync current project's versions into versionsByProject
  useEffect(() => {
    if (projectId != null && versionsProp != null) {
      setVersionsByProject((prev) => ({ ...prev, [projectId]: versionsProp }));
    }
  }, [projectId, versionsProp]);

  // Auto-expand current project when navigating
  useEffect(() => {
    if (projectId != null) {
      setExpandedIds((prev) => new Set(prev).add(projectId));
    }
  }, [projectId]);

  // When user expands a project, fetch its versions if not cached
  const loadVersionsForProject = useCallback(async (pid) => {
    if (versionsByProject[pid] != null) return;
    setLoadingProjectId(pid);
    try {
      const data = await versionService.getByProject(pid);
      setVersionsByProject((prev) => ({ ...prev, [pid]: data || [] }));
    } catch {
      setVersionsByProject((prev) => ({ ...prev, [pid]: [] }));
    } finally {
      setLoadingProjectId(null);
    }
  }, [versionsByProject]);

  const onExpandToggle = useCallback((pid) => {
    const isExpanded = expandedIds.has(pid);
    toggleExpanded(pid);
    if (!isExpanded) loadVersionsForProject(pid);
  }, [expandedIds, toggleExpanded, loadVersionsForProject]);

  return (
    <aside className={SIDEBAR_CLASS}>
      <div className="py-2">
        {loadingProjects ? (
          <div className="px-2 py-3 text-sm text-slate-400">…</div>
        ) : activeProjects.length === 0 ? (
          <div className="px-3 py-2 text-sm text-slate-500">{t('projects.noProjects') || 'No projects'}</div>
        ) : (
          <nav className="space-y-0">
            {activeProjects.map((project) => {
              const isProjectActive = project.id === projectId;
              const isExpanded = expandedIds.has(project.id);
              const versions = versionsByProject[project.id];
              const isLoadingVersions = loadingProjectId === project.id;

              return (
                <div key={project.id} className="select-none">
                  {/* Project row */}
                  <div className="flex items-center min-w-0 group">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); onExpandToggle(project.id); }}
                      className="flex-shrink-0 p-0.5 -ml-0.5 rounded hover:bg-slate-100 text-slate-500"
                      aria-expanded={isExpanded}
                    >
                      <Chevron open={isExpanded} />
                    </button>
                    <Link
                      to={`/projects/${project.id}`}
                      className={`flex items-center gap-2 flex-1 min-w-0 py-1.5 pr-2 rounded-r text-sm transition-colors ${
                        isProjectActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FolderIcon open={isExpanded || isProjectActive} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </div>

                  {/* Versions (indented children) */}
                  {isExpanded && (
                    <div className="ml-4 border-l border-slate-200 pl-2">
                      {isLoadingVersions ? (
                        <div className="py-1.5 text-xs text-slate-400">…</div>
                      ) : !versions || versions.length === 0 ? (
                        <div className="py-1.5 text-xs text-slate-500">{t('versions.noVersions') || 'No versions'}</div>
                      ) : (
                        versions.map((version) => {
                          const isVersionActive = version.id === activeVersionId && project.id === projectId;
                          const openCount = version.testCases?.filter((tc) => tc.status === 'Open').length ?? 0;
                          const fixedCount = version.testCases?.filter((tc) => tc.status === 'Fixed').length ?? 0;
                          const verifiedCount = version.testCases?.filter((tc) => tc.status === 'Verified').length ?? 0;

                          return (
                            <Link
                              key={version.id}
                              to={`/projects/${project.id}/versions/${version.id}`}
                              className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm transition-colors ${
                                isVersionActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <VersionIcon className="w-3.5 h-3.5" />
                              <span className="truncate flex-1">{version.name}</span>
                              {(openCount > 0 || fixedCount > 0 || verifiedCount > 0) && (
                                <span className="flex items-center gap-1 flex-shrink-0">
                                  {openCount > 0 && <span className="px-1 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">{openCount}</span>}
                                  {verifiedCount > 0 && <span className="px-1 py-0.5 rounded text-[10px] bg-green-100 text-green-700">{verifiedCount} OK</span>}
                                </span>
                              )}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
