const { pool } = require('../config/database');

class Habit {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.color = data.color;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    this.isActive = data.is_active !== undefined ? data.is_active : data.isActive;
  }

  // Convert database row to frontend format
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      color: this.color,
      createdAt: this.createdAt,
      isActive: this.isActive
    };
  }

  // Create a new habit
  static async create(habitData) {
    const query = `
      INSERT INTO habits (name, description, category, color, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      habitData.name,
      habitData.description || null,
      habitData.category,
      habitData.color,
      habitData.isActive !== undefined ? habitData.isActive : true
    ];

    try {
      const result = await pool.query(query, values);
      return new Habit(result.rows[0]);
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  // Get all habits
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM habits';
    const values = [];
    const conditions = [];

    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${values.length + 1}`);
      values.push(filters.isActive);
    }

    if (filters.category) {
      conditions.push(`category = $${values.length + 1}`);
      values.push(filters.category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => new Habit(row));
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }
  }

  // Get habit by ID
  static async findById(id) {
    const query = 'SELECT * FROM habits WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return new Habit(result.rows[0]);
    } catch (error) {
      console.error('Error fetching habit by ID:', error);
      throw error;
    }
  }

  // Update habit
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbField = key === 'isActive' ? 'is_active' : key;
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE habits 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return new Habit(result.rows[0]);
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  // Delete habit (soft delete)
  static async delete(id) {
    const query = 'UPDATE habits SET is_active = false WHERE id = $1 RETURNING *';
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return new Habit(result.rows[0]);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // Hard delete habit (removes from database completely)
  static async destroy(id) {
    const query = 'DELETE FROM habits WHERE id = $1 RETURNING *';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error destroying habit:', error);
      throw error;
    }
  }

  // Get habits with completion stats
  static async findAllWithStats(dateRange = 30) {
    const query = `
      SELECT 
        h.*,
        COUNT(he.id) as total_entries,
        COUNT(CASE WHEN he.completed = true THEN 1 END) as completed_entries,
        ROUND(
          COUNT(CASE WHEN he.completed = true THEN 1 END) * 100.0 / 
          NULLIF(COUNT(he.id), 0), 2
        ) as completion_rate
      FROM habits h
      LEFT JOIN habit_entries he ON h.id = he.habit_id 
        AND he.date >= CURRENT_DATE - INTERVAL '${dateRange} days'
      WHERE h.is_active = true
      GROUP BY h.id, h.name, h.description, h.category, h.color, h.created_at, h.updated_at, h.is_active
      ORDER BY h.created_at DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => ({
        ...new Habit(row).toJSON(),
        stats: {
          totalEntries: parseInt(row.total_entries) || 0,
          completedEntries: parseInt(row.completed_entries) || 0,
          completionRate: parseFloat(row.completion_rate) || 0
        }
      }));
    } catch (error) {
      console.error('Error fetching habits with stats:', error);
      throw error;
    }
  }

  // Get categories
  static async getCategories() {
    const query = `
      SELECT category, COUNT(*) as habit_count
      FROM habits 
      WHERE is_active = true
      GROUP BY category
      ORDER BY habit_count DESC, category
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

module.exports = Habit; 