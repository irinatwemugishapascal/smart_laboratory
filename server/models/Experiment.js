const { query } = require('../config/db');

class Experiment {
  static async findAll(subject = null, difficulty = null) {
    let sql = 'SELECT * FROM experiments';
    const params = [];
    const conditions = [];

    if (subject) {
      conditions.push('subject = ?');
      params.push(subject);
    }
    if (difficulty) {
      conditions.push('difficulty = ?');
      params.push(difficulty);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY subject, difficulty';
    return await query(sql, params);
  }

  static async findById(id) {
    const experiments = await query('SELECT * FROM experiments WHERE id = ?', [id]);
    return experiments[0] || null;
  }

  static async getVideos(experimentId) {
    return await query(
      'SELECT * FROM video_tutorials WHERE experiment_id = ? ORDER BY video_type',
      [experimentId]
    );
  }

  static async getAllVideos(subject = null) {
    if (subject) {
      return await query(
        'SELECT * FROM video_tutorials WHERE subject = ? OR subject IS NULL ORDER BY subject, video_type',
        [subject]
      );
    }
    return await query('SELECT * FROM video_tutorials ORDER BY subject, video_type');
  }

  static async getChemicals(category = null) {
    if (category) {
      return await query(
        'SELECT * FROM chemicals WHERE category = ? ORDER BY shelf_position',
        [category]
      );
    }
    return await query('SELECT * FROM chemicals ORDER BY shelf_position, category');
  }

  static async getChemicalReaction(chemical1, chemical2) {
    const reactions = await query(
      `SELECT * FROM chemical_reactions 
       WHERE (reactant1 = ? AND reactant2 = ?) OR (reactant1 = ? AND reactant2 = ?)`,
      [chemical1, chemical2, chemical2, chemical1]
    );
    return reactions[0] || null;
  }

  static async getAllReactions() {
    return await query('SELECT * FROM chemical_reactions ORDER BY reactant1, reactant2');
  }

  static async createResult(userId, experimentId, inputData, resultData, score) {
    const result = await query(
      'INSERT INTO results (user_id, experiment_id, input_data, result_data, score) VALUES (?, ?, ?, ?, ?)',
      [userId, experimentId, JSON.stringify(inputData), JSON.stringify(resultData), score]
    );
    return result.insertId;
  }

  static async getUserResults(userId) {
    return await query(
      `SELECT r.*, e.title, e.subject, e.difficulty
       FROM results r
       JOIN experiments e ON r.experiment_id = e.id
       WHERE r.user_id = ?
       ORDER BY r.completed_at DESC`,
      [userId]
    );
  }

  static async getResultById(resultId, userId) {
    const results = await query(
      `SELECT r.*, e.title, e.subject, e.description, e.theory, e.formula
       FROM results r
       JOIN experiments e ON r.experiment_id = e.id
       WHERE r.id = ? AND r.user_id = ?`,
      [resultId, userId]
    );
    return results[0] || null;
  }

  static async getSubjectStats(userId) {
    return await query(
      `SELECT e.subject, 
        COUNT(r.id) as experiment_count,
        AVG(r.score) as average_score,
        MAX(r.completed_at) as last_completed
       FROM results r
       JOIN experiments e ON r.experiment_id = e.id
       WHERE r.user_id = ?
       GROUP BY e.subject`,
      [userId]
    );
  }

  static async getProgressOverTime(userId) {
    return await query(
      `SELECT DATE(r.completed_at) as date,
        COUNT(*) as experiments_completed,
        AVG(r.score) as avg_score
       FROM results r
       WHERE r.user_id = ?
       GROUP BY DATE(r.completed_at)
       ORDER BY date`,
      [userId]
    );
  }

  static async calculateOhmsLaw(voltage, resistance) {
    if (resistance === 0) throw new Error('Resistance cannot be zero');
    const current = voltage / resistance;
    const power = voltage * current;
    return {
      voltage: parseFloat(voltage.toFixed(2)),
      resistance: parseFloat(resistance.toFixed(2)),
      current: parseFloat(current.toFixed(4)),
      power: parseFloat(power.toFixed(4))
    };
  }

  static async calculateSeriesResistance(resistors) {
    const total = resistors.reduce((sum, r) => sum + r, 0);
    return {
      resistors: resistors,
      totalResistance: parseFloat(total.toFixed(2)),
      configuration: 'series'
    };
  }

  static async calculateParallelResistance(resistors) {
    const reciprocalSum = resistors.reduce((sum, r) => sum + (1 / r), 0);
    const total = 1 / reciprocalSum;
    return {
      resistors: resistors,
      totalResistance: parseFloat(total.toFixed(2)),
      configuration: 'parallel'
    };
  }

  static async calculateNewtonSecondLaw(mass, force) {
    const acceleration = force / mass;
    return {
      mass: parseFloat(mass.toFixed(2)),
      force: parseFloat(force.toFixed(2)),
      acceleration: parseFloat(acceleration.toFixed(4))
    };
  }

  static async calculatePendulumPeriod(length, gravity = 9.8) {
    const period = 2 * Math.PI * Math.sqrt(length / gravity);
    return {
      length: parseFloat(length.toFixed(2)),
      gravity: gravity,
      period: parseFloat(period.toFixed(4)),
      frequency: parseFloat((1 / period).toFixed(4))
    };
  }

  static async calculateLensFormula(objectDistance, imageDistance = null, focalLength = null) {
    let result = {};
    
    if (focalLength && imageDistance) {
      const u = 1 / ((1 / focalLength) - (1 / imageDistance));
      result = { objectDistance: parseFloat(u.toFixed(2)), imageDistance, focalLength };
    } else if (focalLength && objectDistance) {
      const v = 1 / ((1 / focalLength) - (1 / objectDistance));
      result = { objectDistance, imageDistance: parseFloat(v.toFixed(2)), focalLength };
    } else if (objectDistance && imageDistance) {
      const f = 1 / ((1 / objectDistance) + (1 / imageDistance));
      result = { objectDistance, imageDistance, focalLength: parseFloat(f.toFixed(2)) };
    }
    
    const magnification = -result.imageDistance / result.objectDistance;
    result.magnification = parseFloat(magnification.toFixed(4));
    
    return result;
  }

  static async calculateTitration(concentration1, volume1, concentration2 = null, volume2 = null) {
    let result = {};
    
    if (concentration1 && volume1 && volume2) {
      const c2 = (concentration1 * volume1) / volume2;
      result = { concentration1, volume1, volume2, concentration2: parseFloat(c2.toFixed(4)) };
    } else if (concentration1 && volume1 && concentration2) {
      const v2 = (concentration1 * volume1) / concentration2;
      result = { concentration1, volume1, concentration2, volume2: parseFloat(v2.toFixed(4)) };
    }
    
    result.molesAcid = parseFloat((concentration1 * volume1 / 1000).toFixed(6));
    result.molesBase = parseFloat((result.concentration2 * result.volume2 / 1000).toFixed(6));
    
    return result;
  }

  static async calculateReactionRate(initialConcentration, finalConcentration, time) {
    const rate = (initialConcentration - finalConcentration) / time;
    return {
      initialConcentration: parseFloat(initialConcentration.toFixed(4)),
      finalConcentration: parseFloat(finalConcentration.toFixed(4)),
      time: parseFloat(time.toFixed(2)),
      rate: parseFloat(rate.toFixed(6))
    };
  }

  static async calculateOsmosis(initialMass, finalMass) {
    const change = finalMass - initialMass;
    const percentChange = (change / initialMass) * 100;
    return {
      initialMass: parseFloat(initialMass.toFixed(2)),
      finalMass: parseFloat(finalMass.toFixed(2)),
      massChange: parseFloat(change.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(2))
    };
  }

  static async calculateMagnification(imageSize, objectSize) {
    const magnification = imageSize / objectSize;
    return {
      imageSize: parseFloat(imageSize.toFixed(2)),
      objectSize: parseFloat(objectSize.toFixed(2)),
      magnification: parseFloat(magnification.toFixed(2)),
      magnificationX: Math.round(magnification)
    };
  }
}

module.exports = Experiment;
