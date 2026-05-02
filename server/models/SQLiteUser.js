const { db } = require('../config/sqlite-db');
const bcrypt = require('bcrypt');

class SQLiteUser {
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async create(userData) {
    return new Promise((resolve, reject) => {
      const { name, email, password, role = 'student' } = userData;
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...userData });
        }
      );
    });
  }

  static async updateProgress(userId, score) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET 
         total_experiments = total_experiments + 1,
         average_score = (
           (average_score * (total_experiments - 1) + ?) / total_experiments
         )
         WHERE id = ?`,
        [score, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static async getStudentData(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT total_experiments, average_score FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async getAllStudents() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, email, average_score, total_experiments FROM users WHERE role = "student" ORDER BY average_score DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async updateProfile(userId, userData) {
    return new Promise((resolve, reject) => {
      const { name } = userData;
      db.run(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async getUserBadges(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT b.*, ub.earned_at
         FROM badges b
         JOIN user_badges ub ON b.id = ub.badge_id
         WHERE ub.user_id = ?
         ORDER BY ub.earned_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = SQLiteUser;
