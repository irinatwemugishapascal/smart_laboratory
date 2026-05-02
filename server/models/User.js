const { query, transaction } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
  }

  static async findById(id) {
    const users = await query(
      'SELECT id, name, email, role, progress, total_experiments, average_score, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  static async create(userData) {
    const { name, email, password, role = 'student' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    return this.findById(result.insertId);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProgress(userId, progress) {
    await query('UPDATE users SET progress = ? WHERE id = ?', [progress, userId]);
    return this.findById(userId);
  }

  static async incrementExperiments(userId) {
    await query(
      'UPDATE users SET total_experiments = total_experiments + 1 WHERE id = ?',
      [userId]
    );
    return this.findById(userId);
  }

  static async updateAverageScore(userId) {
    const results = await query(
      'SELECT AVG(score) as avg_score FROM results WHERE user_id = ?',
      [userId]
    );
    const avgScore = results[0].avg_score || 0;
    await query('UPDATE users SET average_score = ? WHERE id = ?', [avgScore, userId]);
    return this.findById(userId);
  }

  static async getAllStudents() {
    return await query(
      'SELECT id, name, email, progress, total_experiments, average_score, created_at FROM users WHERE role = ? ORDER BY average_score DESC',
      ['student']
    );
  }

  static async getLeaderboard(limit = 10) {
    return await query(
      `SELECT u.id, u.name, u.progress, u.total_experiments, u.average_score,
        COUNT(DISTINCT ub.badge_id) as badge_count
       FROM users u
       LEFT JOIN user_badges ub ON u.id = ub.user_id
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY u.average_score DESC, u.total_experiments DESC
       LIMIT ?`,
      [limit]
    );
  }

  static async getUserBadges(userId) {
    return await query(
      `SELECT b.*, ub.awarded_at 
       FROM badges b
       JOIN user_badges ub ON b.id = ub.badge_id
       WHERE ub.user_id = ?
       ORDER BY ub.awarded_at DESC`,
      [userId]
    );
  }

  static async awardBadge(userId, badgeId) {
    try {
      await query(
        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badgeId]
      );
      return true;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return false;
      }
      throw error;
    }
  }

  static async checkAndAwardBadges(userId) {
    const user = await this.findById(userId);
    if (!user) return [];

    const newBadges = [];
    const eligibleBadges = await query(
      `SELECT * FROM badges 
       WHERE id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = ?)`,
      [userId]
    );

    for (const badge of eligibleBadges) {
      let shouldAward = false;
      
      switch (badge.requirement_type) {
        case 'experiments_count':
          if (user.total_experiments >= badge.requirement_value) {
            shouldAward = true;
          }
          break;
        case 'average_score':
          if (user.average_score >= badge.requirement_value) {
            shouldAward = true;
          }
          break;
        case 'subject_master':
          const subjectResults = await query(
            `SELECT COUNT(*) as count, AVG(r.score) as avg_score
             FROM results r
             JOIN experiments e ON r.experiment_id = e.id
             WHERE r.user_id = ? AND e.subject IN ('Physics', 'Chemistry', 'Biology')
             GROUP BY e.subject
             HAVING count >= ? AND avg_score >= 80`,
            [userId, badge.requirement_value]
          );
          if (subjectResults.length > 0) {
            shouldAward = true;
          }
          break;
      }

      if (shouldAward) {
        await this.awardBadge(userId, badge.id);
        newBadges.push(badge);
      }
    }

    return newBadges;
  }
}

module.exports = User;
