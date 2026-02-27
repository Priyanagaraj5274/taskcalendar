// fix-tasks.js
const mongoose = require('mongoose');
const Task = require('./models/Task');
require('dotenv').config();

async function fixTasks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Add reminderSent field to all tasks that don't have it
        const result = await Task.updateMany(
            { reminderSent: { $exists: false } },
            { $set: { reminderSent: false } }
        );
        
        console.log(`✅ Added reminderSent field to ${result.modifiedCount} tasks`);
        
        // Also update your specific task
        const lunchTask = await Task.findById('69a00703bef447b7eeaabcee');
        if (lunchTask) {
            lunchTask.reminderSent = false;
            await lunchTask.save();
            console.log('✅ Updated lunch task');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixTasks();