const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

router.use(protect);

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
router.get('/', async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Get today's tasks
        const todayTasks = await Task.find({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        // Get this week's tasks
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weekTasks = await Task.find({
            user: req.user.id,
            date: { $gte: startOfWeek, $lte: endOfWeek },
            completed: false
        });

        // Get completed tasks count
        const completedCount = await Task.countDocuments({
            user: req.user.id,
            completed: true
        });

        // Get overdue tasks
        const overdueTasks = await Task.find({
            user: req.user.id,
            date: { $lt: startOfDay },
            completed: false
        });

        res.json({
            success: true,
            data: {
                today: {
                    count: todayTasks.length,
                    tasks: todayTasks
                },
                week: {
                    count: weekTasks.length,
                    tasks: weekTasks
                },
                completedCount,
                overdueCount: overdueTasks.length,
                overdueTasks
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;