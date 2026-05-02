import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, FlaskConical, Award, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, badgeAPI, experimentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import ProgressBar from '../components/ProgressBar';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [badgesRes, statsRes] = await Promise.all([
        badgeAPI.getMyBadges(),
        experimentAPI.getSubjectStats()
      ]);
      setBadges(badgesRes.data.badges);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await authAPI.updateProfile({ name });
      updateUser({ ...user, name });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and view your achievements</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={48} className="text-primary-600 dark:text-primary-400" />
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-2">
              {editing ? (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field text-lg font-semibold w-64"
                  />
                  <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Check size={20} />
                  </button>
                  <button onClick={handleCancel} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                  <button 
                    onClick={() => setEditing(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Mail size={16} />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Joined {new Date(user?.created_at).toLocaleDateString()}
              </span>
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FlaskConical className="mx-auto mb-2 text-primary-600" size={24} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.total_experiments || 0}</p>
              <p className="text-xs text-gray-500">Experiments</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Award className="mx-auto mb-2 text-amber-500" size={24} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{badges?.length || 0}</p>
              <p className="text-xs text-gray-500">Badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Progress</h3>
        <ProgressBar progress={user?.progress || 0} size="lg" />
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-sm text-gray-500">Physics Avg</p>
            <p className="text-lg font-bold text-amber-600">
              {stats?.find(s => s.subject === 'Physics')?.average_score?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-sm text-gray-500">Chemistry Avg</p>
            <p className="text-lg font-bold text-emerald-600">
              {stats?.find(s => s.subject === 'Chemistry')?.average_score?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <p className="text-sm text-gray-500">Biology Avg</p>
            <p className="text-lg font-bold text-violet-600">
              {stats?.find(s => s.subject === 'Biology')?.average_score?.toFixed(1) || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Badges</h3>
          <span className="text-sm text-gray-500">{badges?.length || 0} total</span>
        </div>
        {badges?.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {badges.slice(0, 6).map((badge) => (
              <div 
                key={badge.id}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{badge.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No badges earned yet. Complete experiments to earn badges!</p>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Breakdown</h3>
          <div className="space-y-3">
            {stats?.map((stat) => (
              <div key={stat.subject} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stat.subject === 'Physics' ? 'bg-amber-100 text-amber-600' :
                    stat.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-violet-100 text-violet-600'
                  }`}>
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{stat.subject}</p>
                    <p className="text-sm text-gray-500">{stat.experiment_count} experiments</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  stat.average_score >= 80 ? 'text-green-600' :
                  stat.average_score >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {parseFloat(stat.average_score).toFixed(1)}%
                </span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No subject data available yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-primary-600" size={20} />
                <span className="text-gray-700 dark:text-gray-300">Average Score</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{user?.average_score?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <FlaskConical className="text-science-chemistry" size={20} />
                <span className="text-gray-700 dark:text-gray-300">Total Experiments</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{user?.total_experiments || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="text-amber-500" size={20} />
                <span className="text-gray-700 dark:text-gray-300">Badges Earned</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{badges?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
