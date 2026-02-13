import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { useLang } from '../context/LangContext';
import { formatRelativeTime } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';

const COLORS = {
  pass: '#10b981',
  fail: '#ef4444',
  blocked: '#f59e0b',
  skipped: '#6b7280'
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [apps, setApps] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { t, lang } = useLang();

  useEffect(() => {
    loadDashboardData();
  }, [lang]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, trendsData, appsData, recentData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getTrends(30),
        dashboardService.getByApp(),
        dashboardService.getRecent(5, lang)
      ]);

      setSummary(summaryData);
      setTrends(trendsData.trends);
      setApps(appsData.apps);
      setRecentRuns(recentData.recentRuns);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const pieData = summary ? [
    { name: t('status.pass'), value: summary.pass, color: COLORS.pass },
    { name: t('status.fail'), value: summary.fail, color: COLORS.fail },
    { name: t('status.blocked'), value: summary.blocked, color: COLORS.blocked },
    { name: t('status.skipped'), value: summary.skipped, color: COLORS.skipped }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="heading-responsive font-bold text-gray-900">{t('dashboard.title')}</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.total')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('status.pass')}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{summary?.pass || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('status.fail')}</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{summary?.fail || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.passRate')}</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{summary?.passRate || 0}%</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.summary')}</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>

        {/* Bar Chart - By App */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.byApp')}</h2>
          {apps.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apps.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="appName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pass" fill={COLORS.pass} name={t('status.pass')} />
                <Bar dataKey="fail" fill={COLORS.fail} name={t('status.fail')} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Trends Line Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.trends')} (Last 30 Days)</h2>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pass" stroke={COLORS.pass} name={t('status.pass')} />
              <Line type="monotone" dataKey="fail" stroke={COLORS.fail} name={t('status.fail')} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name={t('dashboard.total')} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">No data available</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentActivity')}</h2>
          <Link to="/test-runs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>
        
        {recentRuns.length > 0 ? (
          <div className="space-y-3">
            {recentRuns.map((run) => (
              <Link
                key={run.id}
                to={`/test-runs/${run.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {run.testCase.translations[0]?.title || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {run.tester.name} • {formatRelativeTime(run.executedAt)}
                    </p>
                  </div>
                  <StatusBadge status={run.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
