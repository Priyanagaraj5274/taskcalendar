const mongoose = require('mongoose');
const Task = require('./models/Task');
require('dotenv').config();

async function resetReminders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Reset all tasks to allow new reminders
        const result = await Task.updateMany(
            { reminderSent: true },
            { $set: { reminderSent: false } }
        );
        
        console.log(`✅ Reset ${result.modifiedCount} tasks`);
        console.log('✨ All tasks can now send new reminders');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetReminders();