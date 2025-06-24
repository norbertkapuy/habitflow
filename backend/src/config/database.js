const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'habitflow',
  user: process.env.DB_USER || 'habitflow_user',
  password: process.env.DB_PASSWORD || 'habitflow_password',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

// Database schema initialization
const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Create habits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        color VARCHAR(7) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Create habit_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS habit_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, date)
      );
    `);

    // Create settings table for user preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) DEFAULT 'default_user',
        settings JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);
      CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
      CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);
      CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_date ON habit_entries(habit_id, date);
    `);

    // Create updated_at trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Add triggers for updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
      CREATE TRIGGER update_habits_updated_at
        BEFORE UPDATE ON habits
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_settings_updated_at ON user_settings;
      CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON user_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('📦 Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

module.exports = {
  pool,
  initDatabase,
  testConnection,
  closePool
};