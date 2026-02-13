import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { projectService } from '../services/projectService';
import { useLang } from '../context/LangContext';
import Loading from '../components/Loading';

const STATUS_COLORS = { open: '#f59e0b', fixed: '#3b82f6', verified: '#10b981' };

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [projectStats, setProjectStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    projectService.getAll().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [selectedProject]);

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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading && !summary) return <Loading />;

  const pieData = summary ? [
    { name: 'Open', value: summary.byStatus.open, color: STATUS_COLORS.open },
    { name: 'Fixed', value: summary.byStatus.fixed, color: STATUS_COLORS.fixed },
    { name: 'Verified', value: summary.byStatus.verified, color: STATUS_COLORS.verified },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="input w-full sm:w-auto max-w-xs">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500">Total</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{summary?.total || 0}</p>
        </div>
        <div className="card p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500">Open</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{summary?.byStatus.open || 0}</p>
        </div>
        <div className="card p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500">Fixed</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{summary?.byStatus.fixed || 0}</p>
        </div>
        <div className="card p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500">Verified</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{summary?.byStatus.verified || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-12">No data</p>}
        </div>

        {/* By project bar chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Project</h2>
          {projectStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectStats} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="projectName" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="open" fill={STATUS_COLORS.open} name="Open" />
                <Bar dataKey="fixed" fill={STATUS_COLORS.fixed} name="Fixed" />
                <Bar dataKey="verified" fill={STATUS_COLORS.verified} name="Verified" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-12">No data</p>}
        </div>
      </div>

      {/* Severity breakdown */}
      {summary && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">By Severity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-red-50 text-center">
              <p className="text-sm text-red-600">Critical</p>
              <p className="text-2xl font-bold text-red-700">{summary.bySeverity.critical}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 text-center">
              <p className="text-sm text-orange-600">High</p>
              <p className="text-2xl font-bold text-orange-700">{summary.bySeverity.high}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 text-center">
              <p className="text-sm text-yellow-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-700">{summary.bySeverity.medium}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 text-center">
              <p className="text-sm text-gray-600">Low</p>
              <p className="text-2xl font-bold text-gray-700">{summary.bySeverity.low}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fix rate */}
      {summary && summary.total > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Fix Rate</h2>
            <span className="text-2xl font-bold text-green-600">{summary.fixRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${summary.fixRate}%` }} />
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map(tc => (
              <Link
                key={tc.id}
                to={`/projects/${tc.version?.project?.id}/versions/${tc.version?.id}`}
                className="block p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{tc.bug}: {tc.test}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tc.version?.project?.name} / {tc.version?.name} • {tc.createdBy?.name} • {new Date(tc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    tc.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                    tc.status === 'Fixed' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>{tc.status}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-center text-gray-400 py-8">No recent activity</p>}
      </div>
    </div>
  );
};

export default DashboardPage;
