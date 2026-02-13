import { useState, useEffect } from 'react';
import { 
  FiUsers, FiUserCheck, FiUserX, FiAlertTriangle, FiCheckCircle, 
  FiFileText, FiCalendar, FiMapPin, FiRefreshCw 
} from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Colors
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Colors
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/dashboard/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const countyChartData = {
    labels: stats?.counties?.map(c => c.county) || [],
    datasets: [{
      label: 'Youth Members by County',
      data: stats?.counties?.map(c => c.count) || [],
      backgroundColor: [
        'rgba(14, 165, 233, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(14, 165, 233, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 1,
    }]
  };

  const issueStatusData = {
    labels: ['New', 'Under Review', 'Resolved'],
    datasets: [{
      data: [
        stats?.issues?.new_issues || 0,
        stats?.issues?.reviewing_issues || 0,
        stats?.issues?.resolved_issues || 0
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',    // Red - New
        'rgba(245, 158, 11, 0.8)',   // Amber - Reviewing
        'rgba(34, 197, 94, 0.8)'     // Green - Resolved
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(34, 197, 94, 1)'
      ],
      borderWidth: 1,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 12 }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
        <FiAlertTriangle className="mr-2" /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Overview of Atar Youth Association operations in South Sudan</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
              <FiUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.users?.total_users || 0}</p>
              <div className="mt-2 flex items-center">
                <span className="flex items-center text-sm text-green-600">
                  <FiUserCheck className="mr-1" /> {stats?.users?.active_users || 0} Active
                </span>
                <span className="ml-4 flex items-center text-sm text-gray-500">
                  <FiUserX className="mr-1" /> {stats?.users?.inactive_users || 0} Inactive
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Issues */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
              <FiAlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Community Issues</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.issues?.total_issues || 0}</p>
              <div className="mt-2 flex items-center">
                <span className="flex items-center text-sm text-red-600">
                  <FiAlertTriangle className="mr-1" /> {stats?.issues?.new_issues || 0} New
                </span>
                <span className="ml-4 flex items-center text-sm text-green-600">
                  <FiCheckCircle className="mr-1" /> {stats?.issues?.resolved_issues || 0} Resolved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total News */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
              <FiFileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">News & Announcements</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.news?.published_news || 0}</p>
              <p className="mt-1 text-sm text-gray-500">
                {stats?.news?.total_news ? 
                  `${stats.news.published_news}/${stats.news.total_news} published` : 
                  'No news yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Total Activities */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
              <FiCalendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ongoing Activities</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.activities?.ongoing_activities || 0}</p>
              <p className="mt-1 text-sm text-gray-500">
                {stats?.activities?.total_activities ? 
                  `${stats.activities.ongoing_activities}/${stats.activities.total_activities} active` : 
                  'No activities yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* County Distribution */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FiMapPin className="mr-2 text-primary-600" />
              Youth Distribution by County
            </h2>
          </div>
          <div className="h-80">
            {stats?.counties?.length > 0 ? (
              <Pie data={countyChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No county data available
              </div>
            )}
          </div>
        </div>

        {/* Issue Status */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FiAlertTriangle className="mr-2 text-amber-500" />
              Issue Status Overview
            </h2>
          </div>
          <div className="h-80">
            <Pie data={issueStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Community Issues</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recent_issues?.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{issue.type_name}</div>
                      <div className="text-gray-500 text-xs mt-1 line-clamp-1">{issue.description}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{issue.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        issue.status === 'new' ? 'bg-red-100 text-red-800' :
                        issue.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recent_issues || stats.recent_issues.length === 0) && (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No recent issues reported
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">New Community Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recent_users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {user.payam}, {user.county}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recent_users || stats.recent_users.length === 0) && (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No new members recently
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;