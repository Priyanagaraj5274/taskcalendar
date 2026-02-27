const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// @desc    Get all tasks for a user
// @route   GET /api/tasks
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { user: req.user.id };

        // Filter by date range if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const tasks = await Task.find(query).sort({ date: 1, time: 1 });
        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get tasks for specific date
// @route   GET /api/tasks/date/:date
router.get('/date/:date', async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const tasks = await Task.find({
            user: req.user.id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ time: 1 });

        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks for date:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Create a task
// @route   POST /api/tasks
router.post('/', async (req, res) => {
    try {
        const { 
            title, 
            description, 
            date, 
            time, 
            priority, 
            category,
            recurring,
            recurrencePattern,
            recurrenceEndDate 
        } = req.body;

        // Validate required fields
        if (!title || !date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and date are required' 
            });
        }

        const taskData = {
            user: req.user.id,
            title,
            description: description || '',
            date: new Date(date),
            time: time || null,
            priority: priority || 'Medium',
            category: category || 'Other',
            recurring: recurring || false,
            recurrencePattern: recurrencePattern || 'none',
            recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null
        };

        const task = await Task.create(taskData);

        console.log('✅ Task created:', task.title);
        res.status(201).json({ success: true, task });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @desc    Update a task
// @route   PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        // Make sure user owns task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized to edit this task' 
            });
        }

        // Reset reminderSent if date or time changed
        if (req.body.date || req.body.time) {
            req.body.reminderSent = false;
        }

        // Update fields
        const { 
            title, 
            description, 
            date, 
            time, 
            priority, 
            category,
            recurring,
            recurrencePattern,
            recurrenceEndDate 
        } = req.body;
        
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (date) task.date = new Date(date);
        if (time !== undefined) task.time = time;
        if (priority) task.priority = priority;
        if (category) task.category = category;
        if (recurring !== undefined) task.recurring = recurring;
        if (recurrencePattern) task.recurrencePattern = recurrencePattern;
        if (recurrenceEndDate !== undefined) {
            task.recurrenceEndDate = recurrenceEndDate ? new Date(recurrenceEndDate) : null;
        }
        
        // Make sure reminderSent is reset
        if (req.body.reminderSent === false) {
            task.reminderSent = false;
        }

        await task.save();
        
        console.log('✅ Task updated:', task.title);
        res.json({ success: true, task });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        // Make sure user owns task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized to delete this task' 
            });
        }

        await task.deleteOne();
        
        console.log('✅ Task deleted:', task.title);
        res.json({ success: true, message: 'Task removed successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        // Make sure user owns task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized to modify this task' 
            });
        }

        task.completed = !task.completed;
        await task.save();
        
        console.log(`✅ Task ${task.completed ? 'completed' : 'uncompleted'}:`, task.title);
        res.json({ success: true, task });
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

// @desc    Get tasks by category
// @route   GET /api/tasks/category/:category
router.get('/category/:category', async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user.id,
            category: req.params.category
        }).sort({ date: 1, time: 1 });

        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks by category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Task.aggregate([
            { $match: { user: req.user.id } },
            { $group: {
                _id: '$category',
                count: { $sum: 1 },
                completed: { $sum: { $cond: ['$completed', 1, 0] } }
            }}
        ]);

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;