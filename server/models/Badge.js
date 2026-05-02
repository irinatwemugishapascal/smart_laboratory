const { query } = require('../config/db');

class Badge {
  static async findAll() {
    return await query('SELECT * FROM badges ORDER BY requirement_value');
  }

  static async findById(id) {
    const badges = await query('SELECT * FROM badges WHERE id = ?', [id]);
    return badges[0] || null;
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

  static async removeBadge(userId, badgeId) {
    await query(
      'DELETE FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badgeId]
    );
    return true;
  }

  static async create(badgeData) {
    const { name, description, icon, requirement_type, requirement_value } = badgeData;
    const result = await query(
      'INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES (?, ?, ?, ?, ?)',
      [name, description, icon, requirement_type, requirement_value]
    );
    return this.findById(result.insertId);
  }

  static async update(id, badgeData) {
    const { name, description, icon, requirement_type, requirement_value } = badgeData;
    await query(
      'UPDATE badges SET name = ?, description = ?, icon = ?, requirement_type = ?, requirement_value = ? WHERE id = ?',
      [name, description, icon, requirement_type, requirement_value, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await query('DELETE FROM badges WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Badge;
