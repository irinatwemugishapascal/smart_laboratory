const { db } = require('../config/sqlite-db');

class SQLiteExperiment {
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM experiments ORDER BY subject, title', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM experiments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getVideos() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM video_tutorials ORDER BY subject, title', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getChemicals() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM chemicals ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async createResult(resultData) {
    return new Promise((resolve, reject) => {
      const { user_id, experiment_id, score, input_data, result_data, ai_explanation } = resultData;
      db.run(
        'INSERT INTO results (user_id, experiment_id, score, input_data, result_data, ai_explanation) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, experiment_id, score, JSON.stringify(input_data), JSON.stringify(result_data), ai_explanation],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static async getUserResults(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT r.*, e.title, e.subject 
         FROM results r 
         JOIN experiments e ON r.experiment_id = e.id 
         WHERE r.user_id = ? 
         ORDER BY r.created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getUserSubjectStats(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT e.subject, AVG(r.score) as avg_score, COUNT(r.id) as count
         FROM results r
         JOIN experiments e ON r.experiment_id = e.id
         WHERE r.user_id = ?
         GROUP BY e.subject`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT u.name, u.email, u.average_score, u.total_experiments
         FROM users u
         WHERE u.role = 'student'
         ORDER BY u.average_score DESC, u.total_experiments DESC
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getChemicalReaction(reactant1, reactant2) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM chemical_reactions WHERE reactant1 = ? AND (reactant2 = ? OR reactant2 IS NULL)',
        [reactant1, reactant2],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
}

module.exports = SQLiteExperiment;
