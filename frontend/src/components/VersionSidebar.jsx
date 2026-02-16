import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang } from '../context/LangContext';

/**
 * Left sidebar showing versions for navigation.
 * Used on ProjectDetailPage and VersionDetailPage.
 */
export default function VersionSidebar({ versions = [], projectId, currentVersionId = null }) {
  const { t } = useLang();
  const params = useParams();
  const activeVersionId = currentVersionId || parseInt(params.versionId);

  if (!versions || versions.length === 0) {
    return (
      <aside className="hidden lg:block lg:w-64 lg:fixed lg:h-[calc(100vh-3.5rem)] lg:top-14 lg:overflow-y-auto bg-white border-r border-slate-200/80 shadow-sm">
        <div className="p-4">
          <p className="text-sm text-slate-500">{t('versions.noVersions') || 'No versions yet'}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block lg:w-64 lg:fixed lg:h-[calc(100vh-3.5rem)] lg:top-14 lg:overflow-y-auto bg-white border-r border-slate-200/80 shadow-sm">
      <div className="p-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-1">
          {t('versions.title') || 'Versions'}
        </h2>
        <nav className="space-y-0.5">
          {versions.map((version) => {
            const isActive = version.id === activeVersionId;
            const testCaseCount = version.testCases?.length || version._count?.testCases || 0;
            const openCount = version.testCases?.filter(tc => tc.status === 'Open').length || 0;
            const fixedCount = version.testCases?.filter(tc => tc.status === 'Fixed').length || 0;
            const verifiedCount = version.testCases?.filter(tc => tc.status === 'Verified').length || 0;

            return (
              <Link
                key={version.id}
                to={`/projects/${projectId}/versions/${version.id}`}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="truncate">{version.name}</span>
                </div>
                {testCaseCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 ml-6">
                    {openCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{openCount} Open</span>
                    )}
                    {fixedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{fixedCount} Fixed</span>
                    )}
                    {verifiedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700">{verifiedCount} OK</span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
