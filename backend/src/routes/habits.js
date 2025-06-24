const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const router = express.Router();

// Validation middleware
const validateHabit = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  body('color')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color (e.g., #FF0000)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const validateId = [
  param('id')
    .isUUID()
    .withMessage('Invalid habit ID format')
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

// GET /api/habits - Get all habits
router.get('/', [
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('category')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  query('withStats')
    .optional()
    .isBoolean()
    .withMessage('withStats must be a boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { isActive, category, withStats } = req.query;
    const filters = {};
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    
    if (category) {
      filters.category = category;
    }

    let habits;
    if (withStats === 'true') {
      habits = await Habit.findAllWithStats();
    } else {
      const habitObjects = await Habit.findAll(filters);
      habits = habitObjects.map(habit => habit.toJSON());
    }

    res.json({
      success: true,
      data: habits,
      count: habits.length
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch habits'
    });
  }
});

// GET /api/habits/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Habit.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch categories'
    });
  }
});

// GET /api/habits/:id - Get habit by ID
router.get('/:id', validateId, handleValidationErrors, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    
    if (!habit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      data: habit.toJSON()
    });
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch habit'
    });
  }
});

// POST /api/habits - Create new habit
router.post('/', validateHabit, handleValidationErrors, async (req, res) => {
  try {
    const habit = await Habit.create(req.body);
    
    res.status(201).json({
      success: true,
      data: habit.toJSON(),
      message: 'Habit created successfully'
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A habit with this name already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create habit'
    });
  }
});

// PUT /api/habits/:id - Update habit
router.put('/:id', [
  ...validateId,
  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color (e.g., #FF0000)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const habit = await Habit.update(req.params.id, req.body);
    
    if (!habit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      data: habit.toJSON(),
      message: 'Habit updated successfully'
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A habit with this name already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update habit'
    });
  }
});

// DELETE /api/habits/:id - Soft delete habit
router.delete('/:id', validateId, handleValidationErrors, async (req, res) => {
  try {
    const habit = await Habit.delete(req.params.id);
    
    if (!habit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      data: habit.toJSON(),
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete habit'
    });
  }
});

// DELETE /api/habits/:id/destroy - Hard delete habit
router.delete('/:id/destroy', validateId, handleValidationErrors, async (req, res) => {
  try {
    const deleted = await Habit.destroy(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Habit not found'
      });
    }

    res.json({
      success: true,
      message: 'Habit permanently deleted'
    });
  } catch (error) {
    console.error('Error destroying habit:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to permanently delete habit'
    });
  }
});

// POST /api/habits/bulk - Bulk create habits
router.post('/bulk', [
  body('habits')
    .isArray({ min: 1 })
    .withMessage('Habits must be an array with at least one item'),
  body('habits.*.name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Each habit name must be between 1 and 255 characters'),
  body('habits.*.category')
    .isLength({ min: 1, max: 100 })
    .withMessage('Each habit category must be between 1 and 100 characters'),
  body('habits.*.color')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Each habit color must be a valid hex color'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { habits } = req.body;
    const createdHabits = [];
    const errors = [];

    for (const habitData of habits) {
      try {
        const habit = await Habit.create(habitData);
        createdHabits.push(habit.toJSON());
      } catch (error) {
        errors.push({
          habit: habitData.name,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: createdHabits,
      errors: errors.length > 0 ? errors : undefined,
      message: `${createdHabits.length} habits created successfully`
    });
  } catch (error) {
    console.error('Error bulk creating habits:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to bulk create habits'
    });
  }
});

module.exports = router; 