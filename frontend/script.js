// API Configuration
const API_URL = 'https://taskcalendar-api.onrender.com/api';
let currentUser = null;
let currentDate = new Date();
let calendar = null;
let selectedDate = new Date();
let currentTasks = []; // Store tasks for date filtering
let allUserTasks = []; // Store all tasks for global search

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');

// ========== DARK MODE TOGGLE - SIMPLE & RELIABLE ==========
function initDarkMode() {
    // Check if we're in the app (logged in)
    const themeBtn = document.getElementById('theme-toggle');
    
    if (themeBtn) {
        console.log('✅ Dark mode: Button found');
        
        // Get the icon element
        const icon = themeBtn.querySelector('i');
        
        // Apply saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (icon) icon.className = 'fas fa-sun';
        } else {
            document.body.classList.remove('dark-mode');
            if (icon) icon.className = 'fas fa-moon';
        }
        
        // Remove any existing click handlers by cloning and replacing
        const newBtn = themeBtn.cloneNode(true);
        themeBtn.parentNode.replaceChild(newBtn, themeBtn);
        
        // Add new click handler
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle dark mode
            document.body.classList.toggle('dark-mode');
            
            // Update icon and save preference
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'dark');
                console.log('🌙 → ☀️ Dark mode ON');
            } else {
                icon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'light');
                console.log('☀️ → 🌙 Light mode ON');
            }
        });
        
        console.log('✅ Dark mode: Ready to toggle');
        return true;
    }
    
    console.log('⏳ Dark mode: Button not found yet');
    return false;
}

// Check every second for the theme button (especially after login)
setInterval(function() {
    if (document.getElementById('app-container').classList.contains('active')) {
        initDarkMode();
    }
}, 1000);

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        verifyToken(token);
    }
    
    // Initialize search and filter listeners
    initSearchAndFilter();
    // Initialize global search listeners
    initGlobalSearch();
    // Initialize recurrence toggle
    initRecurrenceToggle();
});

// ========== RECURRENCE FUNCTIONS ==========
function initRecurrenceToggle() {
    const recurringCheckbox = document.getElementById('task-recurring');
    const recurrenceOptions = document.getElementById('recurrence-options');
    
    if (recurringCheckbox) {
        recurringCheckbox.addEventListener('change', function() {
            recurrenceOptions.style.display = this.checked ? 'block' : 'none';
        });
    }
}

// ========== GLOBAL SEARCH FUNCTIONS ==========

// Fetch all tasks for the user
async function fetchAllTasks() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            allUserTasks = data.tasks;
            return data.tasks;
        }
        return [];
    } catch (error) {
        console.error('Error fetching all tasks:', error);
        return [];
    }
}

// Perform global search
async function performGlobalSearch() {
    const searchTerm = document.getElementById('global-search')?.value.toLowerCase() || '';
    const priorityFilter = document.getElementById('global-filter-priority')?.value || 'all';
    const categoryFilter = document.getElementById('global-filter-category')?.value || 'all';
    const statusFilter = document.getElementById('global-filter-status')?.value || 'all';
    
    // Fetch latest tasks
    await fetchAllTasks();
    
    const filtered = allUserTasks.filter(task => {
        // Search term filter (title, description, priority, category)
        const matchesSearch = searchTerm === '' || 
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm)) ||
            task.priority.toLowerCase().includes(searchTerm) ||
            (task.category && task.category.toLowerCase().includes(searchTerm));
        
        // Priority filter
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        // Category filter
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'completed' && task.completed) ||
            (statusFilter === 'pending' && !task.completed);
        
        return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });
    
    // Display results
    displayGlobalSearchResults(filtered, searchTerm);
}

// Display global search results
function displayGlobalSearchResults(tasks, searchTerm) {
    const tasksList = document.getElementById('tasks-list');
    const resultsInfo = document.getElementById('search-results-info');
    const selectedDateTitle = document.getElementById('selected-date-title');
    
    if (searchTerm || document.getElementById('global-filter-priority')?.value !== 'all' || 
        document.getElementById('global-filter-category')?.value !== 'all' ||
        document.getElementById('global-filter-status')?.value !== 'all') {
        
        // We're in search mode
        selectedDateTitle.textContent = 'Search Results';
        
        if (tasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-state">No tasks match your search criteria</div>';
            if (resultsInfo) resultsInfo.textContent = '0 results found';
        } else {
            // Group tasks by date
            const groupedTasks = groupTasksByDate(tasks);
            let html = '';
            
            for (const [date, dateTasks] of Object.entries(groupedTasks)) {
                html += `<div class="search-date-group">`;
                html += `<h4 class="search-date-header">${formatDateHeader(date)}</h4>`;
                html += renderTaskList(dateTasks, true);
                html += `</div>`;
            }
            
            tasksList.innerHTML = html;
            if (resultsInfo) resultsInfo.textContent = `Found ${tasks.length} task${tasks.length > 1 ? 's' : ''}`;
        }
    } else {
        // Not in search mode, show regular date view
        if (resultsInfo) resultsInfo.textContent = '';
        loadTasksForDate(selectedDate);
    }
}

// Group tasks by date for display
function groupTasksByDate(tasks) {
    const grouped = {};
    tasks.forEach(task => {
        const dateStr = new Date(task.date).toDateString();
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(task);
    });
    return grouped;
}

// Format date header
function formatDateHeader(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Initialize global search listeners
function initGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    const priorityFilter = document.getElementById('global-filter-priority');
    const categoryFilter = document.getElementById('global-filter-category');
    const statusFilter = document.getElementById('global-filter-status');
    
    if (searchInput) {
        searchInput.addEventListener('input', performGlobalSearch);
    }
    if (priorityFilter) {
        priorityFilter.addEventListener('change', performGlobalSearch);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', performGlobalSearch);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', performGlobalSearch);
    }
}

// ========== DATE-BASED SEARCH FUNCTIONS ==========

// Initialize search and filter for date-based view
function initSearchAndFilter() {
    const searchInput = document.getElementById('search-tasks');
    const priorityFilter = document.getElementById('filter-priority');
    const categoryFilter = document.getElementById('filter-category');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterTasks);
    }
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterTasks);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterTasks);
    }
}

// Filter and search function for date-based view
function filterTasks() {
    const searchTerm = document.getElementById('search-tasks')?.value.toLowerCase() || '';
    const priorityFilter = document.getElementById('filter-priority')?.value || 'all';
    const categoryFilter = document.getElementById('filter-category')?.value || 'all';
    
    const filtered = currentTasks.filter(task => {
        // Search filter
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                            (task.description && task.description.toLowerCase().includes(searchTerm));
        
        // Priority filter
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        // Category filter
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
        
        return matchesSearch && matchesPriority && matchesCategory;
    });
    
    const tasksList = document.getElementById('tasks-list');
    const tasksHtml = renderTaskList(filtered, false);
    tasksList.innerHTML = tasksHtml || '<div class="empty-state">No tasks match your filters</div>';
}

// Render task list (used by both regular and search views)
function renderTaskList(tasksToRender, isSearchView = false) {
    if (!tasksToRender || tasksToRender.length === 0) {
        return '';
    }
    
    return tasksToRender.map(task => {
        const taskDate = new Date(task.date);
        const formattedDate = taskDate.toLocaleDateString();
        
        return `
        <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority.toLowerCase()}">
            <div class="task-content">
                <div class="task-title">
                    ${task.title}
                    ${task.recurring ? '<i class="fas fa-repeat recurrence-icon" title="Repeating task"></i>' : ''}
                </div>
                <div class="task-datetime">
                    ${!isSearchView ? `<span><i class="fas fa-calendar"></i> ${formattedDate}</span>` : ''}
                    ${task.time ? `<span><i class="fas fa-clock"></i> ${task.time}</span>` : ''}
                    <span><i class="fas fa-flag"></i> ${task.priority}</span>
                    <span class="category-badge category-${(task.category || 'other').toLowerCase()}">
                        <i class="fas fa-tag"></i> ${task.category || 'Other'}
                    </span>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTask('${task._id}')">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="edit-btn" onclick="editTask('${task._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteTask('${task._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');
}

// Verify token and get user data
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showApp();
            loadDashboard();
            initCalendar();
            setTimeout(initDarkMode, 500);
            // Fetch all tasks for global search
            setTimeout(fetchAllTasks, 1000);
        } else {
            localStorage.removeItem('token');
            showAuth();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        showAuth();
    }
}

// Show authentication container
function showAuth() {
    authContainer.classList.add('active');
    appContainer.classList.remove('active');
}

// Show main app container
function showApp() {
    authContainer.classList.remove('active');
    appContainer.classList.add('active');
    userName.textContent = currentUser ? currentUser.name : 'User';
}

// Tab switching
document.getElementById('login-tab').addEventListener('click', () => {
    document.querySelector('.tab-btn.active').classList.remove('active');
    document.getElementById('login-tab').classList.add('active');
    document.querySelector('.auth-form.active').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
});

document.getElementById('register-tab').addEventListener('click', () => {
    document.querySelector('.tab-btn.active').classList.remove('active');
    document.getElementById('register-tab').classList.add('active');
    document.querySelector('.auth-form.active').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showApp();
            loadDashboard();
            initCalendar();
            setTimeout(initDarkMode, 500);
            setTimeout(fetchAllTasks, 1000);
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showApp();
            loadDashboard();
            initCalendar();
            setTimeout(initDarkMode, 500);
            setTimeout(fetchAllTasks, 1000);
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    currentUser = null;
    showAuth();
});

// Load dashboard statistics
async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Update statistics cards
function updateStats(data) {
    document.getElementById('today-count').textContent = data.today.count;
    document.getElementById('week-count').textContent = data.week.count;
    document.getElementById('completed-count').textContent = data.completedCount;
    document.getElementById('overdue-count').textContent = data.overdueCount;
}

// Initialize calendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
        },
        dateClick: function(info) {
            selectedDate = new Date(info.date);
            loadTasksForDate(selectedDate);
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                const token = localStorage.getItem('token');
                const startDate = fetchInfo.start.toISOString().split('T')[0];
                const endDate = fetchInfo.end.toISOString().split('T')[0];
                
                const response = await fetch(`${API_URL}/tasks?startDate=${startDate}&endDate=${endDate}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const events = data.tasks.map(task => ({
                        id: task._id,
                        title: task.title,
                        start: task.date.split('T')[0],
                        allDay: true,
                        backgroundColor: task.priority === 'High' ? '#ff4444' : 
                                      task.priority === 'Medium' ? '#ffbb33' : '#00C851',
                        borderColor: task.priority === 'High' ? '#ff4444' : 
                                    task.priority === 'Medium' ? '#ffbb33' : '#00C851'
                    }));
                    successCallback(events);
                }
            } catch (error) {
                console.error('Error loading events:', error);
                failureCallback(error);
            }
        }
    });
    
    calendar.render();
    loadTasksForDate(new Date());
}

// Load tasks for selected date
async function loadTasksForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    document.getElementById('selected-date-title').textContent = 
        `Tasks for ${date.toLocaleDateString()}`;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tasks/date/${dateStr}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentTasks = data.tasks;
            
            // Reset filters
            const searchInput = document.getElementById('search-tasks');
            const priorityFilter = document.getElementById('filter-priority');
            const categoryFilter = document.getElementById('filter-category');
            
            if (searchInput) searchInput.value = '';
            if (priorityFilter) priorityFilter.value = 'all';
            if (categoryFilter) categoryFilter.value = 'all';
            
            const tasksHtml = renderTaskList(currentTasks, false);
            document.getElementById('tasks-list').innerHTML = tasksHtml || '<div class="empty-state">No tasks for this date</div>';
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Toggle task completion
async function toggleTask(taskId) {
    console.log('Toggling task:', taskId);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in!');
            return;
        }
        
        const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Toggle response:', data);
        
        if (data.success) {
            // Reload tasks for current date
            await loadTasksForDate(selectedDate);
            // Refresh calendar
            if (calendar) {
                calendar.refetchEvents();
            }
            // Reload dashboard stats
            await loadDashboard();
            // Refresh all tasks for global search
            await fetchAllTasks();
        } else {
            alert(data.message || 'Failed to update task');
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        alert('Failed to update task. Check console for details.');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadTasksForDate(selectedDate);
            calendar.refetchEvents();
            await loadDashboard();
            await fetchAllTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

// Modal functionality
const modal = document.getElementById('task-modal');
const addTaskBtn = document.getElementById('add-task-btn');
const closeModal = document.querySelector('.close');
const cancelModal = document.getElementById('cancel-modal');
const taskForm = document.getElementById('task-form');

addTaskBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Add New Task';
    document.getElementById('task-id').value = '';
    taskForm.reset();
    
    // Hide recurrence options
    document.getElementById('recurrence-options').style.display = 'none';
    document.getElementById('task-recurring').checked = false;
    
    // Set default date to selected date
    const dateStr = selectedDate.toISOString().split('T')[0];
    document.getElementById('task-date').value = dateStr;
    
    modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

cancelModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Task form submission - UPDATED with recurrence
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const recurring = document.getElementById('task-recurring')?.checked || false;
    
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        date: document.getElementById('task-date').value,
        time: document.getElementById('task-time').value,
        priority: document.getElementById('task-priority').value,
        category: document.getElementById('task-category').value,
        recurring: recurring,
        recurrencePattern: recurring ? document.getElementById('recurrence-pattern').value : 'none',
        recurrenceEndDate: recurring && document.getElementById('recurrence-end').value 
            ? document.getElementById('recurrence-end').value 
            : null
    };
    
    try {
        const token = localStorage.getItem('token');
        const url = taskId ? `${API_URL}/tasks/${taskId}` : `${API_URL}/tasks`;
        const method = taskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            modal.style.display = 'none';
            await loadTasksForDate(selectedDate);
            calendar.refetchEvents();
            await loadDashboard();
            await fetchAllTasks();
            taskForm.reset();
            document.getElementById('recurrence-options').style.display = 'none';
        } else {
            alert('Failed to save task');
        }
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Failed to save task');
    }
});

// Edit task - UPDATED with recurrence
async function editTask(taskId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tasks/date/${selectedDate.toISOString().split('T')[0]}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        const task = data.tasks.find(t => t._id === taskId);
        
        if (task) {
            document.getElementById('modal-title').textContent = 'Edit Task';
            document.getElementById('task-id').value = task._id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-date').value = task.date.split('T')[0];
            document.getElementById('task-time').value = task.time || '';
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-category').value = task.category || 'Other';
            
            // Load recurrence data
            const recurringCheckbox = document.getElementById('task-recurring');
            const recurrenceOptions = document.getElementById('recurrence-options');
            
            if (task.recurring) {
                recurringCheckbox.checked = true;
                recurrenceOptions.style.display = 'block';
                document.getElementById('recurrence-pattern').value = task.recurrencePattern || 'weekly';
                if (task.recurrenceEndDate) {
                    document.getElementById('recurrence-end').value = task.recurrenceEndDate.split('T')[0];
                }
            } else {
                recurringCheckbox.checked = false;
                recurrenceOptions.style.display = 'none';
            }
            
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading task for edit:', error);
        alert('Failed to load task');
    }
}

// Make functions global for onclick handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.editTask = editTask;