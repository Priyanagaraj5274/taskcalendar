# 🗓️ TaskCalendar – Full-Stack Task Management System

A complete, production-ready task management application with calendar integration, user authentication, recurring tasks, and automated email reminders. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

🌐 **Live Demo**: [https://taskcalendar-eta.vercel.app](https://taskcalendar-eta.vercel.app)
📁 **Backend API**: [https://taskcalendar-api.onrender.com](https://taskcalendar-api.onrender.com)

---

## 📸 Screenshots

| Dashboard | Calendar View | Dark Mode |
|-----------|---------------|-----------|
| <img width="1845" height="928" alt="Screenshot 2026-02-27 224659" src="https://github.com/user-attachments/assets/ce87e8b8-3fcb-4e9a-8851-83de0553dcaa" />
| <img width="1474" height="919" alt="Screenshot 2026-02-27 224729" src="https://github.com/user-attachments/assets/c6008bc3-4a85-4811-a87d-dcd9d045efae" />
 | <img width="1419" height="913" alt="Screenshot 2026-02-27 224852" src="https://github.com/user-attachments/assets/daf18a8a-98ac-46c7-b8df-d636272dcf14" />
 |

---

## 🚀 Key Features

### 📊 **Dashboard & Statistics**
- Real-time task statistics (Today's tasks, This week, Completed, Overdue)
- Visual progress tracking
- Live count updates

### ✅ **Task Management**
- Create, edit, delete tasks
- Mark tasks as complete/incomplete
- Priority levels: High, Medium, Low
- Categories: Work, Personal, Shopping, Health, Other
- Rich task details with description, date, and time

### 📅 **Calendar Integration**
- Interactive monthly/weekly/daily calendar views
- Color-coded tasks by priority
- Click on any date to view tasks
- Visual indicators for task density

### 🌙 **Theme System**
- Dark / Light mode toggle
- Persistent theme preference (saved in localStorage)
- Smooth transitions between themes

### 🔍 **Advanced Search & Filtering**
- **Global search** across all tasks (by title, description, priority, category)
- Filter by priority (High/Medium/Low)
- Filter by category (Work/Personal/Shopping/Health/Other)
- Filter by status (Completed/Pending)
- Real-time search results with date grouping

### 🔁 **Recurring Tasks**
- Daily, weekly, monthly, yearly recurrence patterns
- Optional end date for recurrence
- Visual indicator for recurring tasks
- Automatic generation of future instances

### 📧 **Email Reminders**
- Automated email notifications for upcoming tasks
- One-hour-before reminders
- HTML-formatted emails with task details
- Smart tracking to prevent duplicate reminders
- Daily summary emails (optional)

### 👤 **User System**
- Secure registration and login
- JWT-based authentication
- Password encryption with bcrypt
- Private task spaces for each user
- Session management

### 📱 **Responsive Design**
- Works seamlessly on desktop, tablet, and mobile
- Touch-friendly interface
- Adaptive layouts for all screen sizes

### ⚡ **Additional Features**
- Global search results grouped by date
- "Today", "Tomorrow", "Yesterday" smart labels
- One-click task completion toggle
- Edit tasks with pre-filled forms
- Delete with confirmation
- Real-time dashboard updates

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantic layout |
| **CSS3** | Styling, animations, responsiveness, dark mode |
| **JavaScript (ES6+)** | Frontend interactivity and dynamic functionality |
| **Node.js** | Backend runtime environment |
| **Express.js** | RESTful API framework |
| **MongoDB** | Database for users and tasks |
| **Mongoose** | ODM for MongoDB data modeling |
| **JWT** | Secure user authentication |
| **bcryptjs** | Password hashing and encryption |
| **Nodemailer** | Email reminder system |
| **node-cron** | Scheduled tasks (reminders & recurring) |
| **FullCalendar.io** | Interactive calendar views |
| **Font Awesome** | Icons and UI elements |
| **Render** | Backend hosting and deployment |
| **Vercel** | Frontend hosting and deployment |
| **Git/GitHub** | Version control and collaboration |

---

## 📂 Project Structure
taskcalendar/
├── backend/
│ ├── config/
│ │ ├── database.js
│ │ └── email.js
│ ├── jobs/
│ │ ├── recurringTasks.js
│ │ └── reminderService.js
│ ├── middleware/
│ │ └── auth.js
│ ├── models/
│ │ ├── User.js
│ │ └── Task.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── tasks.js
│ │ └── dashboard.js
│ ├── server.js
│ └── package.json
│
├── frontend/
│ ├── index.html
│ ├── style.css
│ └── script.js
│
├── .gitignore
└── README.md


---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
  
- MongoDB Atlas account
  
- Gmail account for email reminders

### Local Installation

1. **Clone the repository**
  
   git clone https://github.com/Priyanagaraj5274/taskcalendar.git
   
   cd taskcalendar
   
3. Install backend dependencies
   
   cd backend
   
   npm install
   
4. Set up environment variables

    Create a .env file in the backend folder:
   
    PORT=5000
   
    MONGODB_URI=your_mongodb_connection_string
   
    JWT_SECRET=your_super_secret_key
   
    JWT_EXPIRE=7d
   
    EMAIL_USER=your_gmail@gmail.com
   
    EMAIL_PASS=your_16_digit_app_password
   
5. Start the backend server
   
     npm run dev

6. Open the frontend
   
  Open frontend/index.html in your browser
  
  Or use Live Server in VS Code
   
☁️ Live Deployment

Component	URL

Frontend (Vercel) :	https://taskcalendar-eta.vercel.app

Backend API (Render): https://taskcalendar-api.onrender.com

API Test Endpoint :	https://taskcalendar-api.onrender.com/api/auth/test

📧 Email Configuration

To enable email reminders in your own deployment:

Enable 2-Factor Authentication on your Gmail account

Generate an App Password at: https://myaccount.google.com/apppasswords

Select: App = "Mail", Device = "Windows Computer"

Copy the 16-digit password

Add it to your .env file as EMAIL_PASS


🤝 Contributing

Contributions, issues, and feature requests are welcome!

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License

This project is free to use for learning and portfolio purposes.

👩‍💻 Author

Priya N
GitHub: @Priyanagaraj5274

🌟 Show Your Support

If you found this project helpful, please consider giving it a ⭐ on GitHub!

🙏 Acknowledgments

FullCalendar.io for the amazing calendar library

Font Awesome for beautiful icons

Render and Vercel for free hosting

MongoDB Atlas for the free database tier

Built with ❤️ using Node.js, Express, MongoDB, and vanilla JavaScript




