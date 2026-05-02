const { db } = require('../config/sqlite-db');

class SQLiteBadge {
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM badges ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
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

  static async awardBadge(userId, badgeId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badgeId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static async create(badgeData) {
    return new Promise((resolve, reject) => {
      const { name, description, icon, requirement } = badgeData;
      db.run(
        'INSERT INTO badges (name, description, icon, requirement) VALUES (?, ?, ?, ?)',
        [name, description, icon, requirement],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...badgeData });
        }
      );
    });
  }

  static async update(id, badgeData) {
    return new Promise((resolve, reject) => {
      const { name, description, icon, requirement } = badgeData;
      db.run(
        'UPDATE badges SET name = ?, description = ?, icon = ?, requirement = ? WHERE id = ?',
        [name, description, icon, requirement, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM badges WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = SQLiteBadge;
