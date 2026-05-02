import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Award, 
  TrendingUp, 
  Calendar, 
  Beaker,
  ArrowRight,
  Zap,
  Microscope,
  BookOpen
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, aiAPI } from '../utils/api';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const COLORS = ['#f59e0b', '#10b981', '#8b5cf6'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, suggestionRes] = await Promise.all([
        dashboardAPI.getStudentDashboard(),
        aiAPI.getSuggestion()
      ]);
      setDashboardData(dashboardRes.data.dashboard);
      setAiSuggestion(suggestionRes.data.suggestion);
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

  const { user: userData, statistics, progressData, recentExperiments, badges } = dashboardData || {};
  const subjectData = statistics?.subjectDistribution || [];
  const pieData = subjectData.map(s => ({ name: s.subject, value: s.count }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-600 to-science-chemistry">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
            <p className="opacity-90">Continue your science journey. You've completed {userData?.totalExperiments} experiments so far!</p>
          </div>
          <div className="hidden md:block">
            <Beaker size={64} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Experiments"
          value={statistics?.totalExperiments || 0}
          icon={FlaskConical}
          color="primary"
          trend="up"
          trendValue="Keep going!"
        />
        <StatCard
          title="Average Score"
          value={`${statistics?.averageScore || 0}%`}
          icon={TrendingUp}
          color="success"
          trend="up"
          trendValue={statistics?.averageScore >= 80 ? 'Excellent!' : 'Improving!'}
        />
        <StatCard
          title="Badges Earned"
          value={statistics?.badgesEarned || 0}
          icon={Award}
          color="warning"
          trend="up"
          trendValue={`${8 - (statistics?.badgesEarned || 0)} more to collect`}
        />
        <StatCard
          title="Overall Progress"
          value={`${userData?.progress || 0}%`}
          icon={Zap}
          color="purple"
          trend="up"
          trendValue={userData?.progress >= 50 ? 'Halfway there!' : 'Getting started!'}
        />
      </div>

      {/* Progress Bar */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Learning Progress</h3>
        <ProgressBar progress={userData?.progress || 0} size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Complete more experiments to increase your progress!
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-600" />
            Progress Over Time
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="experiments_completed" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-science-chemistry" />
            Subject Distribution
          </h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {subjectData.map((subject, index) => (
                <div key={subject.subject} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{subject.subject}</span>
                  <span className="text-sm text-gray-500">({subject.count} experiments)</span>
                  <span className="text-sm font-semibold ml-auto">{subject.averageScore}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="card bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
          <h3 className="text-lg font-semibold mb-3 text-violet-900 dark:text-violet-300 flex items-center gap-2">
            <Microscope size={20} />
            AI Learning Suggestion
          </h3>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm">
            {aiSuggestion}
          </div>
        </div>
      )}

      {/* Recent Experiments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Experiments</h3>
          <button 
            onClick={() => navigate('/experiments')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {recentExperiments?.length > 0 ? (
            recentExperiments.map((exp) => (
              <div 
                key={exp.id} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => navigate('/experiments')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    exp.subject === 'Physics' ? 'bg-amber-100 text-amber-600' :
                    exp.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-violet-100 text-violet-600'
                  }`}>
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{exp.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{exp.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    exp.score >= 80 ? 'bg-green-100 text-green-800' :
                    exp.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exp.score}%
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(exp.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FlaskConical size={48} className="mx-auto mb-3 opacity-50" />
              <p>No experiments completed yet</p>
              <button 
                onClick={() => navigate('/experiments')}
                className="mt-3 btn-primary"
              >
                Start Your First Experiment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Badges Preview */}
      {badges?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Badges</h3>
            <button 
              onClick={() => navigate('/badges')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {badges.slice(0, 4).map((badge) => (
              <div 
                key={badge.id} 
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{badge.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(badge.awarded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
