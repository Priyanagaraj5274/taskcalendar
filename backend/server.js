const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS - Updated with live frontend URL
app.use(cors({
    origin: [
        'http://127.0.0.1:5500', 
        'http://localhost:5500',
        'https://taskcalendar-eta.vercel.app'  // Your live frontend URL
    ],
    credentials: true
}));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Import routes
const auth = require('./routes/auth');
const tasks = require('./routes/tasks');
const dashboard = require('./routes/dashboard');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/tasks', tasks);
app.use('/api/dashboard', dashboard);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

const PORT = process.env.PORT || 5000;

// Import services
const setupRecurringTasks = require('./jobs/recurringTasks');
const setupReminders = require('./jobs/reminderService');

// Start services
setupRecurringTasks();
setupReminders();

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📧 Email configured for: ${process.env.EMAIL_USER}`);
    console.log(`⏰ Reminder service: Active`);
    console.log(`🔄 Recurring tasks: Active`);
});