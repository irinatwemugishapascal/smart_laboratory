import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { badgeAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Badges = () => {
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const [allRes, userRes] = await Promise.all([
        badgeAPI.getAll(),
        badgeAPI.getMyBadges()
      ]);
      setAllBadges(allRes.data.badges);
      setUserBadges(userRes.data.badges);
    } catch (error) {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const hasBadge = (badgeId) => {
    return userBadges.some(ub => ub.id === badgeId);
  };

  const getRequirementText = (badge) => {
    switch (badge.requirement_type) {
      case 'experiments_count':
        return `Complete ${badge.requirement_value} experiments`;
      case 'average_score':
        return `Achieve ${badge.requirement_value}% average score`;
      case 'subject_master':
        return `Complete ${badge.requirement_value} experiments in a subject with 80%+ score`;
      default:
        return badge.description;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="text-amber-500" />
            Badges & Achievements
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            You've earned {userBadges.length} of {allBadges.length} badges
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-amber-600">{userBadges.length}</p>
          <p className="text-sm text-gray-500">Badges Earned</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Collection Progress</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round((userBadges.length / allBadges.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
          <div 
            className="bg-amber-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(userBadges.length / allBadges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Earned Badges */}
      {userBadges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            Earned Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBadges.map((badge) => (
              <div 
                key={badge.id} 
                className="card bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{badge.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{badge.description}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Earned on {new Date(badge.awarded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Badges */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="text-gray-400" size={20} />
          Available Badges
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.filter(b => !hasBadge(b.id)).map((badge) => (
            <div 
              key={badge.id} 
              className="card opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl opacity-50">{badge.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{badge.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{badge.description}</p>
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">
                      <strong>How to unlock:</strong> {getRequirementText(badge)}
                    </p>
                  </div>
                </div>
                <Lock className="text-gray-400 flex-shrink-0" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {allBadges.length === 0 && (
        <div className="text-center py-12">
          <Award size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No badges available yet</p>
        </div>
      )}
    </div>
  );
};

export default Badges;
