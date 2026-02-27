const cron = require('node-cron');
const Task = require('../models/Task');

// Run every day at midnight
const setupRecurringTasks = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('🔁 Checking for recurring tasks to generate...');
        
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Find all recurring tasks that need to generate new instances
            const recurringTasks = await Task.find({
                recurring: true,
                $or: [
                    { recurrenceEndDate: null },
                    { recurrenceEndDate: { $gte: today } }
                ]
            });
            
            for (const task of recurringTasks) {
                await generateNextOccurrence(task);
            }
            
            console.log(`✅ Generated recurring tasks for ${recurringTasks.length} patterns`);
        } catch (error) {
            console.error('Error generating recurring tasks:', error);
        }
    });
};

const generateNextOccurrence = async (parentTask) => {
    const lastDate = new Date(parentTask.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nextDate = null;
    
    switch (parentTask.recurrencePattern) {
        case 'daily':
            nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate = new Date(lastDate);
            nextDate.setMonth(lastDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDate = new Date(lastDate);
            nextDate.setFullYear(lastDate.getFullYear() + 1);
            break;
        default:
            return;
    }
    
    // Check if we need to generate a new task
    if (nextDate <= today) {
        // Check if task already exists for this date
        const existingTask = await Task.findOne({
            parentTaskId: parentTask._id,
            date: {
                $gte: nextDate,
                $lt: new Date(nextDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        
        if (!existingTask) {
            const newTask = new Task({
                user: parentTask.user,
                title: parentTask.title,
                description: parentTask.description,
                date: nextDate,
                time: parentTask.time,
                priority: parentTask.priority,
                category: parentTask.category,
                recurring: true,
                recurrencePattern: parentTask.recurrencePattern,
                recurrenceEndDate: parentTask.recurrenceEndDate,
                parentTaskId: parentTask._id
            });
            
            await newTask.save();
            console.log(`✅ Generated recurring task: ${newTask.title} for ${nextDate.toDateString()}`);
        }
    }
};

module.exports = setupRecurringTasks;