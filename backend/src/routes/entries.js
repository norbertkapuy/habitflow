const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const HabitEntry = require('../models/HabitEntry');
const Habit = require('../models/Habit');
const router = express.Router();

// Validation middleware
const validateEntry = [
  body('habitId')
    .isUUID()
    .withMessage('Invalid habit ID format'),
  body('date')
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),
  body('completed')
    .isBoolean()
    .withMessage('Completed must be a boolean')
];

const validateId = [
  param('habitId')
    .isUUID()
    .withMessage('Invalid habit ID format')
];

const validateDate = [
  param('date')
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

// GET /api/entries - Get all entries
router.get('/', [
  query('habitId')
    .optional()
    .isUUID()
    .withMessage('Invalid habit ID format'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format'),
  query('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { habitId, startDate, endDate, completed } = req.query;
    
    let entries;
    if (habitId) {
      // Get entries for specific habit
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (completed !== undefined) filters.completed = completed === 'true';
      
      entries = await HabitEntry.findByHabitId(habitId, filters);
    } else if (startDate && endDate) {
      // Get entries for date range
      entries = await HabitEntry.findByDateRange(startDate, endDate);
    } else {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either habitId or both startDate and endDate are required'
      });
    }

    res.json({
      success: true,
      data: entries.map(entry => entry.toJSON()),
      count: entries.length
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch entries'
    });
  }
});

// GET /api/entries/habits/:habitId - Get all entries for a habit
router.get('/habits/:habitId', [
  ...validateId,
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format'),
  query('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { habitId } = req.params;
    const { startDate, endDate, completed } = req.query;
    
    // Check if habit exists
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (completed !== undefined) filters.completed = completed === 'true';

    const entries = await HabitEntry.findByHabitId(habitId, filters);

    res.json({
      success: true,
      data: entries.map(entry => entry.toJSON()),
      count: entries.length,
      habit: habit.toJSON()
    });
  } catch (error) {
    console.error('Error fetching habit entries:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch habit entries'
    });
  }
});

// GET /api/entries/habits/:habitId/stats - Get completion stats for a habit
router.get('/habits/:habitId/stats', [
  ...validateId,
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { habitId } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    // Check if habit exists
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    const [stats, streak] = await Promise.all([
      HabitEntry.getCompletionStats(habitId, days),
      HabitEntry.getCurrentStreak(habitId)
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        currentStreak: streak,
        habit: habit.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch habit statistics'
    });
  }
});

// GET /api/entries/habits/:habitId/:date - Get specific entry
router.get('/habits/:habitId/:date', [
  ...validateId,
  ...validateDate,
  handleValidationErrors
], async (req, res) => {
  try {
    const { habitId, date } = req.params;
    
    const entry = await HabitEntry.findByHabitAndDate(habitId, date);
    
    if (!entry) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Entry not found for this habit and date'
      });
    }

    res.json({
      success: true,
      data: entry.toJSON()
    });
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch entry'
    });
  }
});

// POST /api/entries - Create or update entry
router.post('/', validateEntry, handleValidationErrors, async (req, res) => {
  try {
    const { habitId, date, completed } = req.body;
    
    // Check if habit exists
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    const entry = await HabitEntry.upsert({
      habitId,
      date,
      completed
    });

    res.status(201).json({
      success: true,
      data: entry.toJSON(),
      message: 'Entry saved successfully'
    });
  } catch (error) {
    console.error('Error creating/updating entry:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to save entry'
    });
  }
});

// PUT /api/entries/habits/:habitId/:date - Update specific entry
router.put('/habits/:habitId/:date', [
  ...validateId,
  ...validateDate,
  body('completed')
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { habitId, date } = req.params;
    const { completed } = req.body;
    
    // Check if habit exists
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    const entry = await HabitEntry.upsert({
      habitId,
      date,
      completed
    });

    res.json({
      success: true,
      data: entry.toJSON(),
      message: 'Entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update entry'
    });
  }
});

// DELETE /api/entries/habits/:habitId/:date - Delete entry
router.delete('/habits/:habitId/:date', [
  ...validateId,
  ...validateDate,
  handleValidationErrors
], async (req, res) => {
  try {
    const { habitId, date } = req.params;
    
    const deleted = await HabitEntry.delete(habitId, date);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete entry'
    });
  }
});

// POST /api/entries/bulk - Bulk create/update entries
router.post('/bulk', [
  body('entries')
    .isArray({ min: 1 })
    .withMessage('Entries must be an array with at least one item'),
  body('entries.*.habitId')
    .isUUID()
    .withMessage('Each entry must have a valid habit ID'),
  body('entries.*.date')
    .isISO8601()
    .withMessage('Each entry must have a valid date'),
  body('entries.*.completed')
    .isBoolean()
    .withMessage('Each entry must have a completed boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { entries } = req.body;
    
    // Validate all habit IDs exist
    const habitIds = [...new Set(entries.map(e => e.habitId))];
    const habits = await Promise.all(
      habitIds.map(id => Habit.findById(id))
    );
    
    const missingHabits = habitIds.filter((id, index) => !habits[index]);
    if (missingHabits.length > 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Habits not found: ${missingHabits.join(', ')}`
      });
    }

    const savedEntries = await HabitEntry.bulkCreate(entries);

    res.status(201).json({
      success: true,
      data: savedEntries.map(entry => entry.toJSON()),
      count: savedEntries.length,
      message: 'Entries saved successfully'
    });
  } catch (error) {
    console.error('Error bulk creating entries:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to bulk save entries'
    });
  }
});

// GET /api/entries/export - Export entries data
router.get('/export', [
  query('habitIds')
    .optional()
    .custom((value) => {
      if (value) {
        const ids = value.split(',');
        return ids.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
      }
      return true;
    })
    .withMessage('Invalid habit ID format in habitIds'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { habitIds } = req.query;
    const habitIdArray = habitIds ? habitIds.split(',') : null;
    
    const entries = await HabitEntry.exportData(habitIdArray);

    res.json({
      success: true,
      data: entries,
      count: entries.length,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting entries:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to export entries'
    });
  }
});

module.exports = router; 