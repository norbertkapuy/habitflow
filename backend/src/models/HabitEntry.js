const { pool } = require('../config/database');

class HabitEntry {
  constructor(data) {
    this.id = data.id;
    this.habitId = data.habit_id || data.habitId;
    this.date = data.date;
    this.completed = data.completed;
    this.completedAt = data.completed_at || data.completedAt;
    this.createdAt = data.created_at || data.createdAt;
  }

  // Convert database row to frontend format
  toJSON() {
    return {
      id: this.id,
      habitId: this.habitId,
      date: this.date,
      completed: this.completed,
      completedAt: this.completedAt
    };
  }

  // Create or update habit entry
  static async upsert(entryData) {
    const query = `
      INSERT INTO habit_entries (habit_id, date, completed, completed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (habit_id, date)
      DO UPDATE SET
        completed = EXCLUDED.completed,
        completed_at = EXCLUDED.completed_at
      RETURNING *
    `;

    const values = [
      entryData.habitId,
      entryData.date,
      entryData.completed,
      entryData.completed ? new Date() : null
    ];

    try {
      const result = await pool.query(query, values);
      return new HabitEntry(result.rows[0]);
    } catch (error) {
      console.error('Error upserting habit entry:', error);
      throw error;
    }
  }

  // Get all entries for a habit
  static async findByHabitId(habitId, filters = {}) {
    let query = 'SELECT * FROM habit_entries WHERE habit_id = $1';
    const values = [habitId];
    let paramCount = 2;

    if (filters.startDate) {
      query += ` AND date >= $${paramCount}`;
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND date <= $${paramCount}`;
      values.push(filters.endDate);
      paramCount++;
    }

    if (filters.completed !== undefined) {
      query += ` AND completed = $${paramCount}`;
      values.push(filters.completed);
      paramCount++;
    }

    query += ' ORDER BY date DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => new HabitEntry(row));
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      throw error;
    }
  }

  // Get entries for multiple habits
  static async findByHabitIds(habitIds, filters = {}) {
    if (!habitIds || habitIds.length === 0) {
      return [];
    }

    let query = 'SELECT * FROM habit_entries WHERE habit_id = ANY($1)';
    const values = [habitIds];
    let paramCount = 2;

    if (filters.startDate) {
      query += ` AND date >= $${paramCount}`;
      values.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND date <= $${paramCount}`;
      values.push(filters.endDate);
      paramCount++;
    }

    if (filters.completed !== undefined) {
      query += ` AND completed = $${paramCount}`;
      values.push(filters.completed);
      paramCount++;
    }

    query += ' ORDER BY date DESC, habit_id';

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => new HabitEntry(row));
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      throw error;
    }
  }

  // Get all entries for a date range
  static async findByDateRange(startDate, endDate, habitIds = null) {
    let query = 'SELECT * FROM habit_entries WHERE date >= $1 AND date <= $2';
    const values = [startDate, endDate];

    if (habitIds && habitIds.length > 0) {
      query += ' AND habit_id = ANY($3)';
      values.push(habitIds);
    }

    query += ' ORDER BY date DESC, habit_id';

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => new HabitEntry(row));
    } catch (error) {
      console.error('Error fetching entries by date range:', error);
      throw error;
    }
  }

  // Get entry by habit and date
  static async findByHabitAndDate(habitId, date) {
    const query = 'SELECT * FROM habit_entries WHERE habit_id = $1 AND date = $2';

    try {
      const result = await pool.query(query, [habitId, date]);
      if (result.rows.length === 0) {
        return null;
      }
      return new HabitEntry(result.rows[0]);
    } catch (error) {
      console.error('Error fetching habit entry:', error);
      throw error;
    }
  }

  // Delete entry
  static async delete(habitId, date) {
    const query = 'DELETE FROM habit_entries WHERE habit_id = $1 AND date = $2 RETURNING *';

    try {
      const result = await pool.query(query, [habitId, date]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting habit entry:', error);
      throw error;
    }
  }

  // Get completion stats for a habit
  static async getCompletionStats(habitId, days = 30) {
    const query = `
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_days,
        ROUND(
          COUNT(CASE WHEN completed = true THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 2
        ) as completion_rate,
        MAX(CASE WHEN completed = true THEN date END) as last_completed_date
      FROM habit_entries 
      WHERE habit_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    try {
      const result = await pool.query(query, [habitId]);
      const stats = result.rows[0];
      return {
        totalDays: parseInt(stats.total_days) || 0,
        completedDays: parseInt(stats.completed_days) || 0,
        completionRate: parseFloat(stats.completion_rate) || 0,
        lastCompletedDate: stats.last_completed_date
      };
    } catch (error) {
      console.error('Error fetching completion stats:', error);
      throw error;
    }
  }

  // Get current streak for a habit
  static async getCurrentStreak(habitId) {
    const query = `
      WITH consecutive_days AS (
        SELECT 
          date,
          completed,
          date - ROW_NUMBER() OVER (ORDER BY date) * INTERVAL '1 day' as grp
        FROM habit_entries
        WHERE habit_id = $1 
          AND completed = true
          AND date <= CURRENT_DATE
        ORDER BY date DESC
      )
      SELECT COUNT(*) as streak_length
      FROM consecutive_days
      WHERE grp = (
        SELECT grp 
        FROM consecutive_days 
        WHERE date = (
          SELECT MAX(date) 
          FROM consecutive_days
        )
      )
    `;

    try {
      const result = await pool.query(query, [habitId]);
      return parseInt(result.rows[0]?.streak_length) || 0;
    } catch (error) {
      console.error('Error fetching current streak:', error);
      return 0;
    }
  }

  // Get habit entries for export
  static async exportData(habitIds = null) {
    let query = `
      SELECT 
        he.*,
        h.name as habit_name,
        h.category as habit_category
      FROM habit_entries he
      JOIN habits h ON he.habit_id = h.id
    `;
    const values = [];

    if (habitIds && habitIds.length > 0) {
      query += ' WHERE he.habit_id = ANY($1)';
      values.push(habitIds);
    }

    query += ' ORDER BY he.date DESC, h.name';

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => ({
        ...new HabitEntry(row).toJSON(),
        habitName: row.habit_name,
        habitCategory: row.habit_category
      }));
    } catch (error) {
      console.error('Error exporting habit entries:', error);
      throw error;
    }
  }

  // Bulk create entries
  static async bulkCreate(entries) {
    if (!entries || entries.length === 0) {
      return [];
    }

    const values = [];
    const placeholders = [];
    
    entries.forEach((entry, index) => {
      const offset = index * 4;
      placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      values.push(
        entry.habitId,
        entry.date,
        entry.completed,
        entry.completed ? new Date() : null
      );
    });

    const query = `
      INSERT INTO habit_entries (habit_id, date, completed, completed_at)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (habit_id, date)
      DO UPDATE SET
        completed = EXCLUDED.completed,
        completed_at = EXCLUDED.completed_at
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => new HabitEntry(row));
    } catch (error) {
      console.error('Error bulk creating habit entries:', error);
      throw error;
    }
  }
}

module.exports = HabitEntry; 