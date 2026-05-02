import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FlaskConical, 
  TrendingUp, 
  Award,
  ArrowRight,
  Search,
  Filter,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { dashboardAPI } from '../utils/api';
import StatCard from '../components/StatCard';
import { toast } from 'react-toastify';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const COLORS = ['#f59e0b', '#10b981', '#8b5cf6'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getTeacherDashboard();
      setDashboardData(response.data.dashboard);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { summary, students, leaderboard, subjectStats, recentActivity } = dashboardData || {};

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const subjectChartData = subjectStats?.map(s => ({
    name: s.subject,
    students: s.studentCount,
    avgScore: parseFloat(s.averageScore)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor student progress and performance</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/experiments')}
            className="btn-primary flex items-center gap-2"
          >
            <FlaskConical size={18} />
            Browse Experiments
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={summary?.totalStudents || 0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Experiments Completed"
          value={summary?.totalExperimentsCompleted || 0}
          icon={FlaskConical}
          color="success"
        />
        <StatCard
          title="Overall Average Score"
          value={`${summary?.overallAverageScore || 0}%`}
          icon={TrendingUp}
          color="warning"
        />
        <StatCard
          title="Active Today"
          value={summary?.activeToday || 0}
          icon={GraduationCap}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student Distribution by Subject */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Students per Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performers</h3>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            View Full Leaderboard <ArrowRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Student</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Experiments</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Badges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.slice(0, 5).map((student, index) => (
                <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      student.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      student.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      student.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {student.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.progress}% complete</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{student.total_experiments}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      student.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                      student.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.averageScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{student.badge_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Students */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Students</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-64"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Progress</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Experiments</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.email}</td>
                    <td className="py-3 px-4">
                      <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{student.totalExperiments}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        student.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                        student.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-500">
                      {new Date(student.joinedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No students found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentActivity?.slice(0, 10).map((activity, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.subject === 'Physics' ? 'bg-amber-100 text-amber-600' :
                  activity.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-violet-100 text-violet-600'
                }`}>
                  <FlaskConical size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.studentName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    completed {activity.experimentTitle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activity.score >= 80 ? 'bg-green-100 text-green-800' :
                  activity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activity.score}%
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )) || (
            <p className="text-center text-gray-500 py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
