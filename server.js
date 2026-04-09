const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Mock Database Arrays ---
// Default admin account
const users = [
    { username: 'admin', password: 'password', fullName: 'College Administrator', role: 'admin' },
    { username: 'test', password: 'test', fullName: 'Test Student', role: 'student' }
];

const complaints = [
    { id: 1, title: 'WiFi in Library', description: 'The WiFi on the second floor is very slow.', status: 'Pending', author: 'Test Student', date: new Date().toISOString() }
];

const events = [
    { id: 1, title: 'Tech Fest 2026', date: '2026-05-15', description: 'Annual college technology festival.', time: '10:00 AM' },
    { id: 2, title: 'Guest Lecture: AI in Web Dev', date: '2026-04-20', description: 'Seminar by industry experts.', time: '02:00 PM' }
];

const holidays = [
    { id: 1, title: 'Spring Break', date: '2026-04-10 to 2026-04-17' },
    { id: 2, title: 'Labor Day', date: '2026-05-01' }
];

const timetable = [
    { time: '09:00 AM', day: 'Monday', title: 'Data Structures & Algorithms', location: 'Room 302' },
    { time: '11:00 AM', day: 'Monday', title: 'Calculus III', location: 'Room 105' },
    { time: '02:00 PM', day: 'Tuesday', title: 'Web Engineering', location: 'Lab 4' }
];

const exams = [
    { id: 1, title: 'Mid Semester - Data Structures', date: '2026-04-25', time: '09:00 AM', status: 'Upcoming' },
    { id: 2, title: 'Web Engineering Practicals', date: '2026-04-28', time: '02:00 PM', status: 'Upcoming' }
];

const notifications = [
    { id: 1, text: 'Library will be closed for maintenance tomorrow from 2PM to 4PM.', type: 'alert' },
    { id: 2, text: 'Tech Fest registration is now open!', type: 'info' }
];

// --- Authentication Endpoints ---

app.post('/api/register', (req, res) => {
    const { username, password, fullName } = req.body;

    if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });

    const userExists = users.find(u => u.username === username);
    if (userExists) return res.status(409).json({ error: 'Username taken.' });

    // New registrations are 'student' by default
    const newUser = { username, password, fullName, role: 'student' };
    users.push(newUser);
    
    res.status(201).json({ message: 'Registered successfully!', user: { username, fullName, role: 'student' } });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.status(200).json({ message: 'Login successful!', user: { username: user.username, fullName: user.fullName, role: user.role } });
    } else {
        res.status(401).json({ error: 'Invalid username or password.' });
    }
});

// --- Feature Endpoints ---

// Complaints
app.get('/api/complaints', (req, res) => res.json(complaints));
app.post('/api/complaints', (req, res) => {
    const { title, description, author } = req.body;
    const newComplaint = { id: complaints.length + 1, title, description, author, status: 'Pending', date: new Date().toISOString() };
    complaints.push(newComplaint);
    res.status(201).json(newComplaint);
});

// Events
app.get('/api/events', (req, res) => res.json(events));
app.post('/api/events', (req, res) => {
    const { title, date, time, description } = req.body;
    const newEv = { id: events.length + 1, title, date, time, description };
    events.push(newEv);
    res.status(201).json(newEv);
});

// Holidays
app.get('/api/holidays', (req, res) => res.json(holidays));

// Timetable
app.get('/api/timetable', (req, res) => res.json(timetable));

// Exams
app.get('/api/exams', (req, res) => res.json(exams));

// Notifications
app.get('/api/notifications', (req, res) => res.json(notifications));


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
