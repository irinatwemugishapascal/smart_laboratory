import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, User } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await dashboardAPI.getLeaderboard(20);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Medal className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Medal className="text-amber-600" size={24} />;
      default: return <span className="w-6 text-center font-bold text-gray-400">{rank}</span>;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
      case 2: return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200';
      case 3: return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200';
      default: return '';
    }
  };

  const isCurrentUser = (userId) => {
    return user?.id === userId;
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
      <div className="text-center">
        <Trophy className="mx-auto text-amber-500 mb-2" size={48} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Top performing students in SmartLaboratory</p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex flex-col items-center justify-end p-2">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-gray-600 dark:text-gray-300">2</span>
              </div>
              <p className="text-xs font-medium truncate w-full">{leaderboard[1].name}</p>
              <p className="text-xs text-gray-500">{leaderboard[1].averageScore}%</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="w-28 h-40 bg-yellow-100 dark:bg-yellow-900/30 rounded-t-lg flex flex-col items-center justify-end p-2 border-2 border-yellow-300">
              <Medal className="text-yellow-500 mb-2" size={32} />
              <div className="w-14 h-14 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-yellow-700">1</span>
              </div>
              <p className="text-sm font-semibold truncate w-full">{leaderboard[0].name}</p>
              <p className="text-sm text-yellow-600 font-bold">{leaderboard[0].averageScore}%</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="w-24 h-28 bg-amber-100 dark:bg-amber-900/20 rounded-t-lg flex flex-col items-center justify-end p-2">
              <div className="w-12 h-12 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-amber-700">3</span>
              </div>
              <p className="text-xs font-medium truncate w-full">{leaderboard[2].name}</p>
              <p className="text-xs text-gray-500">{leaderboard[2].averageScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Rank</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Student</th>
              <th className="text-center py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Experiments</th>
              <th className="text-center py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</th>
              <th className="text-center py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Badges</th>
              <th className="text-center py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-400">Progress</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((student) => (
              <tr 
                key={student.id} 
                className={`border-b border-gray-100 dark:border-gray-800 ${
                  isCurrentUser(student.id) 
                    ? 'bg-primary-50 dark:bg-primary-900/20' 
                    : getRankStyle(student.rank)
                }`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    {getRankIcon(student.rank)}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrentUser(student.id) 
                        ? 'bg-primary-100 dark:bg-primary-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <User size={18} className={isCurrentUser(student.id) ? 'text-primary-600' : 'text-gray-500'} />
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrentUser(student.id) ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                        {student.name} {isCurrentUser(student.id) && '(You)'}
                      </p>
                      <p className="text-xs text-gray-500">{student.progress}% complete</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">{student.total_experiments}</td>
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    student.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                    student.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.averageScore}%
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Award size={16} className="text-amber-500" />
                    <span>{student.badge_count}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="w-24 mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Your Stats */}
      {user && !leaderboard.find(s => s.id === user.id) && (
        <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <p className="font-medium text-primary-900 dark:text-primary-300">Keep going!</p>
                <p className="text-sm text-primary-700 dark:text-primary-400">
                  Complete more experiments to appear on the leaderboard
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {user.total_experiments || 0}
              </p>
              <p className="text-sm text-primary-600">experiments</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
