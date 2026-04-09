// app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const authView = document.getElementById('auth-view');
    const appLayout = document.getElementById('app-layout');
    const authForm = document.getElementById('auth-form');
    let toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authBtn = document.getElementById('auth-btn');
    const authToggleText = document.getElementById('auth-toggle-text');
    const nameGroup = document.getElementById('name-group');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Navigation and Layout
    const navItems = document.querySelectorAll('.nav-item');
    const pageViews = document.querySelectorAll('.page-view');
    const currentViewTitle = document.getElementById('current-view-title');
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');

    // Notifications
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    const notifBadge = document.getElementById('notif-badge');
    const notifList = document.getElementById('notif-list');

    // Forms
    const newComplaintBtn = document.getElementById('new-complaint-btn');
    const complaintFormContainer = document.getElementById('complaint-form-container');
    const complaintForm = document.getElementById('complaint-form');
    const cancelComplaintBtn = document.getElementById('cancel-complaint-btn');

    const newEventBtn = document.getElementById('new-event-btn');
    const eventFormContainer = document.getElementById('event-form-container');
    const eventForm = document.getElementById('event-form');
    const cancelEventBtn = document.getElementById('cancel-event-btn');

    // --- State ---
    let isLoginMode = true;
    let currentUser = null;

    // --- Initialization ---
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showApp();
    }

    // --- Event Listeners ---
    
    function attachToggleListener() {
        toggleAuthModeBtn.addEventListener('click', toggleAuthMode);
    }

    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        authError.textContent = '';
        
        if (isLoginMode) {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Unlock your learning potential today.';
            authBtn.textContent = 'Sign In';
            nameGroup.classList.add('hidden');
            document.getElementById('reg-name').required = false;
            authToggleText.innerHTML = 'First time here? <br> <span id="toggle-auth-mode" class="text-link">Create a new account</span>';
        } else {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join the Smart Study Companion today.';
            authBtn.textContent = 'Sign Up';
            nameGroup.classList.remove('hidden');
            document.getElementById('reg-name').required = true;
            authToggleText.innerHTML = 'Already have an account? <br> <span id="toggle-auth-mode" class="text-link">Sign in instead</span>';
        }

        toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
        attachToggleListener();
    }
    attachToggleListener();

    // Authentication Form Submit
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('reg-name').value.trim();
        
        if (username.length < 3 || password.length < 3) {
            authError.textContent = 'Please enter valid credentials.';
            return;
        }

        authBtn.disabled = true;
        authBtn.textContent = 'Please wait...';

        try {
            const endpoint = isLoginMode ? '/api/login' : '/api/register';
            const payload = isLoginMode ? { username, password } : { username, password, fullName };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                authError.textContent = data.error || 'Something went wrong.';
            } else {
                currentUser = data.user;
                localStorage.setItem('user', JSON.stringify(data.user));
                showApp();
            }
        } catch (err) {
            authError.textContent = 'Network error. Please make sure the server is running.';
        } finally {
            authBtn.disabled = false;
            authBtn.textContent = isLoginMode ? 'Sign In' : 'Sign Up';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        currentUser = null;
        showAuthView();
    });

    // Navigation and Mobile toggle
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            pageViews.forEach(v => v.classList.remove('active', 'hidden'));
            
            pageViews.forEach(v => v.id !== targetId ? v.classList.add('hidden') : v.classList.add('active'));

            currentViewTitle.textContent = item.textContent.trim();

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }

            fetchViewData(targetId);
        });
    });

    // Notifications toggle
    notifBtn.addEventListener('click', () => {
        notifDropdown.classList.toggle('hidden');
        notifDropdown.classList.toggle('active');
    });

    // Toggle forms
    if(newComplaintBtn) newComplaintBtn.addEventListener('click', () => complaintFormContainer.classList.remove('hidden'));
    if(cancelComplaintBtn) cancelComplaintBtn.addEventListener('click', () => complaintFormContainer.classList.add('hidden'));

    if(newEventBtn) newEventBtn.addEventListener('click', () => eventFormContainer.classList.remove('hidden'));
    if(cancelEventBtn) cancelEventBtn.addEventListener('click', () => eventFormContainer.classList.add('hidden'));

    // Submit Forms
    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('comp-title').value;
        const desc = document.getElementById('comp-desc').value;
        
        await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description: desc, author: currentUser.fullName })
        });
        complaintForm.reset();
        complaintFormContainer.classList.add('hidden');
        fetchViewData('complaints-view');
    });

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('ev-title').value;
        const date = document.getElementById('ev-date').value;
        const time = document.getElementById('ev-time').value;
        const desc = document.getElementById('ev-desc').value;

        await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, date, time, description: desc })
        });
        eventForm.reset();
        eventFormContainer.classList.add('hidden');
        fetchViewData('events-view');
    });

    // --- Core Functions ---
    
    function showApp() {
        authView.classList.remove('active');
        authView.classList.add('hidden');
        
        document.getElementById('user-role-badge').textContent = currentUser.role;
        populateProfile();
        
        // Show proper views based on role
        if (currentUser.role === 'admin') {
            const adminEls = document.querySelectorAll('.admin-only');
            adminEls.forEach(el => el.classList.remove('hidden'));
        }

        appLayout.classList.remove('hidden');
        appLayout.classList.add('active');
        
        // Default View
        fetchViewData('dashboard-view');
        fetchNotifications();
    }
    
    function showAuthView() {
        appLayout.classList.remove('active');
        appLayout.classList.add('hidden');
        authView.classList.remove('hidden');
        authView.classList.add('active');
        authForm.reset();
        authError.textContent = '';
    }

    function populateProfile() {
        document.getElementById('profile-name').textContent = currentUser.fullName;
        const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        document.getElementById('avatar-initials').textContent = initials || 'US';
        
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
    }

    async function fetchViewData(viewId) {
        try {
            if (viewId === 'dashboard-view' || viewId === 'timetable-view') {
                const res = await fetch('/api/timetable');
                const data = await res.json();
                if (viewId === 'dashboard-view') renderDashboardSchedule(data);
                if (viewId === 'timetable-view') renderTimetable(data);
            }
            else if (viewId === 'complaints-view') {
                const res = await fetch('/api/complaints');
                const data = await res.json();
                renderComplaints(data);
            }
            else if (viewId === 'events-view') {
                const res = await fetch('/api/events');
                const data = await res.json();
                renderEvents(data);
            }
            else if (viewId === 'holidays-view') {
                const res = await fetch('/api/holidays');
                const data = await res.json();
                renderHolidays(data);
            }
            else if (viewId === 'exams-view') {
                const res = await fetch('/api/exams');
                const data = await res.json();
                renderExams(data);
            }
        } catch (err) {
            console.error('Failed to fetch data for', viewId, err);
        }
    }

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            notifBadge.textContent = data.length;
            notifList.innerHTML = '';
            data.forEach(n => {
                const li = document.createElement('li');
                if(n.type === 'alert') li.classList.add('notif-alert');
                li.textContent = n.text;
                notifList.appendChild(li);
            });
        } catch(e) {}
    }

    // --- Render Functions ---
    
    function renderDashboardSchedule(data) {
        const container = document.getElementById('dashboard-schedule-timeline');
        container.innerHTML = '';
        if(data.length === 0) return container.innerHTML = '<p class="text-muted">No classes today.</p>';
        
        data.slice(0, 4).forEach((item, i) => { // Show first few for dashboard
            container.innerHTML += `
                <div class="schedule-item fade-in delay-1">
                    <div class="schedule-time">${item.time}</div>
                    <div class="schedule-details">
                        <h4>${item.title}</h4>
                        <p>${item.location} • ${item.day}</p>
                    </div>
                </div>
            `;
        });
    }

    function renderComplaints(data) {
        const container = document.getElementById('complaints-list');
        container.innerHTML = '';
        data.slice().reverse().forEach(c => {
            const statusClass = c.status.toLowerCase() === 'pending' ? 'status-pending' : 'status-resolved';
            const date = new Date(c.date).toLocaleDateString();
            container.innerHTML += `
                <div class="list-item fade-in delay-1">
                    <div class="item-header">
                        <span class="item-title">${c.title}</span>
                        <span class="item-status ${statusClass}">${c.status}</span>
                    </div>
                    <p class="item-desc">${c.description}</p>
                    <div class="item-meta">
                        <span><i class="fas fa-user"></i> ${c.author}</span>
                        <span><i class="fas fa-calendar"></i> ${date}</span>
                    </div>
                </div>
            `;
        });
    }

    function renderEvents(data) {
        const container = document.getElementById('events-list');
        container.innerHTML = '';
        data.forEach(ev => {
            container.innerHTML += `
                <div class="event-card fade-in delay-1">
                    <span class="event-date-badge">${new Date(ev.date).toLocaleDateString()}</span>
                    <h4>${ev.title}</h4>
                    <p>${ev.description}</p>
                    <div class="meta">
                        <i class="fas fa-clock"></i> ${ev.time}
                    </div>
                </div>
            `;
        });
    }

    function renderHolidays(data) {
        const list = document.getElementById('holidays-list');
        list.innerHTML = '';
        data.forEach(h => {
            list.innerHTML += `
                <li class="fade-in delay-1">
                    <span class="title">${h.title}</span>
                    <span class="date">${h.date}</span>
                </li>
            `;
        });
    }

    function renderTimetable(data) {
        const tbody = document.getElementById('timetable-tbody');
        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr class="fade-in">
                    <td>${t.day}</td>
                    <td><strong>${t.time}</strong></td>
                    <td>${t.title}</td>
                    <td>${t.location}</td>
                </tr>
            `;
        });
    }

    function renderExams(data) {
        const container = document.getElementById('exams-list');
        container.innerHTML = '';
        data.forEach(ex => {
            container.innerHTML += `
                <div class="list-item fade-in delay-1">
                    <div class="item-header">
                        <span class="item-title">${ex.title}</span>
                        <span class="item-status status-pending">${ex.status}</span>
                    </div>
                    <div class="item-meta">
                        <span><i class="fas fa-calendar-alt"></i> Date: ${ex.date}</span>
                        <span><i class="fas fa-clock"></i> Time: ${ex.time}</span>
                    </div>
                </div>
            `;
        });
    }
});
