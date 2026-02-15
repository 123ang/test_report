import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { projectService } from '../services/projectService';
import { useLang } from '../context/LangContext';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import Loading from '../components/Loading';

const STATUS_COLORS = { open: '#f59e0b', fixed: '#3b82f6', verified: '#10b981' };

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [projectStats, setProjectStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useLang();
  const { setItems: setBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumb([{ label: t('nav.dashboard'), to: null }]);
  }, [setBreadcrumb, t]);

  useEffect(() => {
    projectService.getAll().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      const pid = selectedProject || undefined;
      const [s, p, r] = await Promise.all([
        dashboardService.getSummary(pid),
        dashboardService.getByProject(),
        dashboardService.getRecent(8, pid),
      ]);
      setSummary(s);
      setProjectStats(p.projects || []);
      setRecent(r.recent || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) return <Loading />;

  const pieData = summary
    ? [
        { name: 'Open', value: summary.byStatus.open, color: STATUS_COLORS.open },
        { name: 'Fixed', value: summary.byStatus.fixed, color: STATUS_COLORS.fixed },
        { name: 'Verified', value: summary.byStatus.verified, color: STATUS_COLORS.verified },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="min-h-full space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary-50 via-white to-primary-50/50 border border-primary-100/80 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200/20 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{t('dashboard.title')}</h1>
              <p className="text-slate-600 mt-1 max-w-xl">{t('dashboard.subtitle')}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{t('dashboard.filterByProject')}</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="input py-2.5 text-sm min-w-[180px] rounded-xl border-primary-200/80 focus:ring-primary-500/20">
              <option value="">{t('dashboard.allProjects')}</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.totalTestCases'), value: summary?.total ?? 0, icon: 'stack', color: 'primary', bg: 'bg-primary-100', text: 'text-primary-600' },
          { label: t('status.Open'), value: summary?.byStatus?.open ?? 0, icon: 'clock', color: 'amber', bg: 'bg-amber-100', text: 'text-amber-600' },
          { label: t('status.Fixed'), value: summary?.byStatus?.fixed ?? 0, icon: 'gear', color: 'primary', bg: 'bg-primary-100', text: 'text-primary-600' },
          { label: t('status.Verified'), value: summary?.byStatus?.verified ?? 0, icon: 'check', color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={stat.label} className="animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center`}>
                {stat.icon === 'stack' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                {stat.icon === 'clock' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {stat.icon === 'gear' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                {stat.icon === 'check' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-2xl font-bold tabular-nums mt-0.5 ${stat.icon === 'stack' ? 'text-slate-900' : stat.text}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Quick access: projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{t('dashboard.quickAccess')}</h2>
          <Link to="/projects" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">{t('dashboard.viewAllProjects')} →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projectStats.map((ps, i) => (
            <Link
              key={ps.projectId}
              to={`/projects/${ps.projectId}`}
              className="animate-fade-in-up block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-xl hover:border-primary-200/90 hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${240 + i * 50}ms` }}
            >
              <p className="font-semibold text-slate-900 truncate">{ps.projectName}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"><span className="tabular-nums font-semibold text-slate-800">{ps.total}</span> {t('dashboard.totalShort')}</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium"><span className="tabular-nums font-semibold">{ps.open}</span> {t('dashboard.openShort')}</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium"><span className="tabular-nums font-semibold">{ps.fixed}</span> {t('dashboard.fixedShort')}</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium"><span className="tabular-nums font-semibold">{ps.verified}</span> {t('dashboard.verifiedShort')}</span>
              </div>
            </Link>
          ))}
          <Link
            to="/projects"
            className="animate-fade-in-up flex flex-col items-center justify-center min-h-[120px] rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/40 transition-all duration-200"
            style={{ animationDelay: `${240 + projectStats.length * 50}ms` }}
          >
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
            <span className="text-sm font-medium">{t('dashboard.newProject')}</span>
          </Link>
        </div>
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /></svg>
            </span>
            {t('dashboard.statusDistribution')}
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="white" strokeWidth={2} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="text-sm">{t('dashboard.noDataYet')}</p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </span>
            {t('dashboard.byProject')}
          </h2>
          {projectStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={projectStats} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="projectName" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="open" fill={STATUS_COLORS.open} name={t('status.Open')} />
                <Bar dataKey="fixed" fill={STATUS_COLORS.fixed} name={t('status.Fixed')} />
                <Bar dataKey="verified" fill={STATUS_COLORS.verified} name={t('status.Verified')} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="text-sm">{t('dashboard.noDataYet')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          {t('dashboard.recentActivity')}
        </h2>
        {recent.length > 0 ? (
          <ul className="space-y-2">
            {recent.map((tc) => (
              <li key={tc.id}>
                <Link
                  to={`/projects/${tc.version?.project?.id}/versions/${tc.version?.id}`}
                  className="block px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 hover:border-primary-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate text-sm">{tc.bug}: {tc.test}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tc.version?.project?.name} / {tc.version?.name} · {tc.createdBy?.name} · {new Date(tc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      tc.status === 'Open' ? 'bg-amber-100 text-amber-800 border border-amber-200/80' :
                      tc.status === 'Fixed' ? 'bg-primary-100 text-primary-800 border border-primary-200/80' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200/80'
                    }`}>
                      {tc.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </section>
    </div>
  );
}
