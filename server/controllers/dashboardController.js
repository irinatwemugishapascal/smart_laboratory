const User = require('../models/User');
const Experiment = require('../models/Experiment');
const SQLiteUser = require('../models/SQLiteUser');
const SQLiteExperiment = require('../models/SQLiteExperiment');

// Use SQLite if MySQL is not available
const UserModel = User || SQLiteUser;
const ExperimentModel = Experiment || SQLiteExperiment;

exports.getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await UserModel.getStudentData(userId);
    const badges = await UserModel.getUserBadges(userId);
    const results = await ExperimentModel.getUserResults(userId);
    const subjectStats = await ExperimentModel.getUserSubjectStats(userId);
    const progressOverTime = await ExperimentModel.getProgressOverTime(userId);
    
    const totalExperiments = results.length;
    const averageScore = results.length > 0 
      ? (results.reduce((sum, r) => sum + parseFloat(r.score || 0), 0) / results.length).toFixed(2)
      : 0;
    
    const subjectDistribution = subjectStats.map(stat => ({
      subject: stat.subject,
      count: stat.experiment_count,
      averageScore: parseFloat(stat.average_score).toFixed(2)
    }));
    
    const recentExperiments = results.slice(0, 5).map(r => ({
      id: r.id,
      title: r.title,
      subject: r.subject,
      score: r.score,
      completedAt: r.completed_at
    }));
    
    res.json({
      dashboard: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          progress: user.progress,
          role: user.role,
          totalExperiments: user.total_experiments,
          averageScore: parseFloat(user.average_score).toFixed(2),
          badges: badges.length
        },
        statistics: {
          totalExperiments,
          averageScore,
          badgesEarned: badges.length,
          subjectDistribution
        },
        progressData: progressOverTime,
        recentExperiments,
        badges: badges.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const students = await UserModel.getAllStudents();
    const leaderboard = await ExperimentModel.getLeaderboard(50);
    
    const allResults = await query(
      `SELECT r.*, e.subject, u.name as student_name
       FROM results r
       JOIN experiments e ON r.experiment_id = e.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.completed_at DESC
       LIMIT 50`
    );
    
    const subjectStats = await query(
      `SELECT e.subject,
        COUNT(DISTINCT r.user_id) as student_count,
        COUNT(r.id) as total_attempts,
        AVG(r.score) as average_score
       FROM results r
       JOIN experiments e ON r.experiment_id = e.id
       GROUP BY e.subject`
    );
    
    const studentPerformance = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      progress: student.progress,
      totalExperiments: student.total_experiments,
      averageScore: parseFloat(student.average_score).toFixed(2),
      joinedDate: student.created_at
    }));
    
    res.json({
      dashboard: {
        summary: {
          totalStudents: students.length,
          totalExperimentsCompleted: allResults.length,
          overallAverageScore: subjectStats.length > 0
            ? (subjectStats.reduce((sum, s) => sum + parseFloat(s.average_score), 0) / subjectStats.length).toFixed(2)
            : 0,
          activeToday: 0
        },
        students: studentPerformance,
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          ...entry,
          averageScore: parseFloat(entry.average_score).toFixed(2)
        })),
        subjectStats: subjectStats.map(stat => ({
          subject: stat.subject,
          studentCount: stat.student_count,
          totalAttempts: stat.total_attempts,
          averageScore: parseFloat(stat.average_score).toFixed(2)
        })),
        recentActivity: allResults.slice(0, 20).map(r => ({
          studentName: r.student_name,
          experimentTitle: r.title,
          subject: r.subject,
          score: r.score,
          completedAt: r.completed_at
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await User.getLeaderboard(limit);
    
    res.json({
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry,
        averageScore: parseFloat(entry.average_score).toFixed(2)
      }))
    });
  } catch (error) {
    next(error);
  }
};

const { query } = require('../config/db');
