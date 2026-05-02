const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database file
const dbPath = path.join(__dirname, '..', 'data', 'smartlab.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database with tables
const initDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        average_score DECIMAL(5,2) DEFAULT 0.00,
        total_experiments INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      // Experiments table
      db.run(`CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(20) NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'Medium',
        description TEXT,
        theory TEXT,
        procedure TEXT,
        calculation_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      // Results table
      db.run(`CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        experiment_id INTEGER NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        input_data JSON,
        result_data JSON,
        ai_explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (experiment_id) REFERENCES experiments(id)
      )`);

      // Badges table
      db.run(`CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        requirement TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      // User badges table
      db.run(`CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        badge_id INTEGER NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id),
        UNIQUE(user_id, badge_id)
      )`);

      // Chemical reactions table
      db.run(`CREATE TABLE IF NOT EXISTS chemical_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reactant1 VARCHAR(100) NOT NULL,
        reactant2 VARCHAR(100),
        product VARCHAR(100) NOT NULL,
        reaction_type VARCHAR(100),
        color_change VARCHAR(50),
        precipitate BOOLEAN DEFAULT FALSE,
        gas_bubbles BOOLEAN DEFAULT FALSE,
        temperature_change VARCHAR(50),
        explanation TEXT
      )`);

      // Chemicals table
      db.run(`CREATE TABLE IF NOT EXISTS chemicals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        formula VARCHAR(100),
        type VARCHAR(50),
        color VARCHAR(50),
        state VARCHAR(50),
        hazard_level VARCHAR(20) DEFAULT 'low',
        description TEXT
      )`);

      // Video tutorials table
      db.run(`CREATE TABLE IF NOT EXISTS video_tutorials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500),
        youtube_id VARCHAR(100),
        subject VARCHAR(20) NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'Medium',
        duration INTEGER,
        description TEXT,
        ai_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      console.log('✅ SQLite database initialized successfully');
      resolve();
    });
  });
};

// Insert sample data
const insertSampleData = async () => {
  // Insert sample experiments
  const experiments = [
    ['Ohm\'s Law Verification', 'Physics', 'Medium', 'Verify Ohm\'s law by measuring voltage and current', 'Ohm\'s law states V=IR', 'Measure voltage across resistor for different currents', 'ohms_law'],
    ['Acid-Base Titration', 'Chemistry', 'Medium', 'Determine concentration of unknown acid/base', 'Titration involves neutralization reaction', 'Add titrant until endpoint reached', 'titration'],
    ['Microscope Observation', 'Biology', 'Easy', 'Observe cells under microscope', 'Cells are basic unit of life', 'Prepare slide and observe under microscope', 'microscope']
  ];

  for (const exp of experiments) {
    db.run('INSERT OR IGNORE INTO experiments (title, subject, difficulty, description, theory, procedure, calculation_type) VALUES (?, ?, ?, ?, ?, ?, ?)', exp);
  }

  // Insert sample badges
  const badges = [
    ['First Experiment', 'Complete your first experiment', '🧪', 'Complete any experiment'],
    ['Physics Explorer', 'Complete 5 physics experiments', '⚡', 'Complete 5 physics experiments'],
    ['Chemistry Master', 'Complete 5 chemistry experiments', '🧬', 'Complete 5 chemistry experiments'],
    ['Biology Expert', 'Complete 5 biology experiments', '🔬', 'Complete 5 biology experiments']
  ];

  for (const badge of badges) {
    db.run('INSERT OR IGNORE INTO badges (name, description, icon, requirement) VALUES (?, ?, ?, ?)', badge);
  }

  // Insert demo users
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  db.run('INSERT OR IGNORE INTO users (name, email, password, role, average_score, total_experiments) VALUES (?, ?, ?, ?, ?, ?)', 
    ['Demo Student', 'student@example.com', hashedPassword, 'student', 75.5, 12]);
  
  db.run('INSERT OR IGNORE INTO users (name, email, password, role, average_score, total_experiments) VALUES (?, ?, ?, ?, ?, ?)', 
    ['Demo Teacher', 'teacher@example.com', hashedPassword, 'teacher', 85.0, 18]);

  console.log('✅ Sample data inserted successfully');
};

// Initialize database on startup
initDB().then(() => {
  insertSampleData();
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
});

module.exports = {
  db,
  initDB,
  insertSampleData
};
