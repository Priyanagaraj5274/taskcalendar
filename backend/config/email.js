const nodemailer = require('nodemailer');

// Create transporter
let transporter;

const initializeTransporter = () => {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    console.log('📧 Email transporter initialized');
};

// Send email function
const sendEmail = async (to, subject, html) => {
    try {
        if (!transporter) {
            initializeTransporter();
        }
        
        const mailOptions = {
            from: `"TaskCalendar" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return false;
    }
};

module.exports = { sendEmail };