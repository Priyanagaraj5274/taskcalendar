const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"TaskCalendar" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return false;
    }
};

// Check reminders every minute
const checkReminders = async () => {
    try {
        const now = new Date();
        const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
        
        console.log(`\n🔍 Checking reminders at ${now.toLocaleTimeString()}`);
        
        // Get all uncompleted tasks
        const tasks = await Task.find({ 
            completed: false 
        }).populate('user');
        
        console.log(`   Total uncompleted tasks: ${tasks.length}`);
        
        // Find tasks due in next hour
        const dueTasks = tasks.filter(task => {
            if (!task.user || !task.user.email) return false;
            if (task.reminderSent) return false;
            
            // Create task datetime
            const taskDate = new Date(task.date);
            if (task.time) {
                const [hours, minutes] = task.time.split(':').map(Number);
                taskDate.setHours(hours, minutes, 0, 0);
            } else {
                // If no time, consider it due all day
                taskDate.setHours(0, 0, 0, 0);
            }
            
            // Check if due in next hour (with 1 minute buffer)
            const timeDiff = taskDate - now;
            const isDue = timeDiff > -60000 && timeDiff <= 60 * 60 * 1000; // -1 minute to +1 hour
            
            if (isDue) {
                console.log(`   ⏰ Task due: ${task.title} at ${taskDate.toLocaleTimeString()}`);
            }
            
            return isDue;
        });
        
        console.log(`   Tasks due in next hour: ${dueTasks.length}`);
        
        // Send emails for due tasks
        for (const task of dueTasks) {
            console.log(`   📧 Sending reminder for: ${task.title}`);
            
            const taskDate = new Date(task.date);
            const dateStr = taskDate.toLocaleDateString();
            const timeStr = task.time || 'Anytime';
            
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #667eea; text-align: center;">⏰ Task Reminder</h2>
                    <p>Hello <strong>${task.user.name}</strong>,</p>
                    <p>Your task is due soon:</p>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">${task.title}</h3>
                        ${task.description ? `<p style="color: #666;">${task.description}</p>` : ''}
                        <p><strong>Due:</strong> ${dateStr} at ${timeStr}</p>
                        <p><strong>Priority:</strong> ${task.priority}</p>
                        <p><strong>Category:</strong> ${task.category || 'Other'}</p>
                    </div>
                    
                    <a href="http://127.0.0.1:5500/frontend/index.html" style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">View Task</a>
                    
                    <p style="color: #999; margin-top: 20px; font-size: 12px;">TaskCalendar Reminder</p>
                </div>
            `;
            
            const sent = await sendEmail(task.user.email, `⏰ Reminder: ${task.title}`, html);
            
            if (sent) {
                task.reminderSent = true;
                await task.save();
                console.log(`   ✅ Reminder sent for: ${task.title}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Reminder error:', error);
    }
};

// Start reminder service
const setupReminders = () => {
    console.log('⏰ Starting reminder service...');
    // Run every minute
    cron.schedule('* * * * *', () => {
        checkReminders();
    });
};

module.exports = setupReminders;