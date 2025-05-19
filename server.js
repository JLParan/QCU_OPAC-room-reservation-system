const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Setup mail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jhonloydparan13@gmail.com',
        pass: 'phthavbmpiovdred' // Use Gmail App Password
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.error('Transporter verification failed:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

app.use(cors());
app.options(/.*/, cors()); // Pre-flight response for all routes
app.use(express.json()); // for JSON
app.use(express.urlencoded({ extended: true })); // for form submissions

// Connect to the database
const db = new sqlite3.Database('./database/reservation.db', (err) => {
    if (err) {
        console.error('Error connecting to DB:', err.message);
    } else {
        console.log('Connected to the reservation.db');
    }
});

// Make DB accessible globally (optional)
app.locals.db = db;

// Set static folder
app.use(express.static(__dirname)); // serve from the main folder

// POST route for reservation confirmation
app.post('/confirm-button', (req, res) => {
    console.log('POST request received for /confirm-button');
    console.log('Request body:', req.body);
    const { date, time, program, numStudents, students, reason, created_at = '' } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).send('Student details are required');
    }

    const [start_time, end_time] = time.split(' - ').map(str => str.trim());
    const mainStudent = students[0];
    const companionStudents = students.slice(1); // rest go to Addedstud
    const createdAtFormatted = new Date(created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
console.log("Formatted created_at in PHT:", createdAtFormatted);
// Example output: "5/16/2025, 12:46:38 PM" (depends on your system's locale)


    const insertReservation = `
        INSERT INTO Reservation 
        (date, fullName, studID, num_participants, program, start_time, end_time, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(insertReservation, [
        date,
        mainStudent.name,
        mainStudent.id,
        parseInt(numStudents),
        program,
        start_time,
        end_time,
        reason,
        created_at
    ], function (err) {
        if (err) {
            console.error('Error inserting main reservation:', err.message);
            return res.status(500).send('Failed to save reservation');
        }

        const reservationID = this.lastID;

        const mailOptions = {
    from: 'jhonloydparan13@gmail.com',
    to: 'paran.jhonloyd.redoma@gmail.com', // can be the admin or the user's email if you collect it
    subject: 'New Room Reservation Submitted',
    text: `
        You have made a reservation.

        Name: ${mainStudent.name}
        ID: ${mainStudent.id}
        Program: ${program}
        Date: ${date}
        Time: ${time}
        Participants: ${numStudents}
        Reason: ${reason}
    `
};

transporter.sendMail(mailOptions, (error, info) => {
                
    if (error) {
        console.error('Error sending email:', error);
    } else {
        console.log('Email sent:', info.response);
    }
});

        if (companionStudents.length === 0) {
            return res.send('Reservation submitted successfully (no companions)');
        }

        const insertCompanion = `
            INSERT INTO Addedstud (reservationID, fullName, studID)
            VALUES (?, ?, ?)
        `;

        let completed = 0;
        let errors = [];

        companionStudents.forEach(student => {
            db.run(insertCompanion, [reservationID, student.name, student.id], (err) => {
                completed++;
                if (err) {
                    errors.push(err.message);
                }

                if (completed === companionStudents.length) {
                    if (errors.length) {
                        console.error('Errors adding companions:', errors);
                        return res.status(500).send('Reservation saved, but failed to add some companions');
                    } else {
                        return res.send('Reservation and companions submitted successfully');
                    }
                }
            });
        });
    });
});

// GET route to fetch reservation records
app.get('/api/reservations', (req, res) => {
    const sql = `
        SELECT reservationID, fullName, studID, date, num_participants, program, start_time, end_time, reason
        FROM Reservation
        ORDER BY date DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Failed to fetch reservations:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.get('/api/notifications', (req, res) => {
    const sql = `
        SELECT reservationID, fullName, date, program, start_time, created_at
        FROM Reservation
        ORDER BY created_at DESC
        LIMIT 50`; // Adjust the limit based on how many notifications you want to show
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching notifications:', err.message);
            return res.status(500).json({ error: 'Failed to fetch notifications' });
        }
        const notifications = rows.map(reservation => {
            return {
                message: `<strong>New Reservation:</strong> ${reservation.fullName} has made a new reservation.`,
                time: new Date(reservation.created_at).toLocaleTimeString(),
            };
        });
        res.json(notifications);
    });
});

// GET route to fetch today's reservations
app.get('/api/reservations-today', (req, res) => {
    const selectedDate = req.query.date;

    if (!selectedDate) {
        return res.status(400).json({ error: 'Date is required' });
    }

    const sql = `
        SELECT reservationID, fullName, date, start_time
        FROM Reservation
        WHERE DATE(date) = DATE(?)
        ORDER BY start_time ASC
    `;

    const datePattern = selectedDate + '%';

    db.all(sql, [selectedDate], (err, rows) => {
        if (err) {
            console.error('Error fetching reservations:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(rows);
    });
});

// GET route to fetch total number of bookings
app.get('/api/total-bookings', (req, res) => {
    const sql = `SELECT COUNT(*) AS total FROM Reservation`;

    db.get(sql, [], (err, row) => {
        if (err) {
            console.error('Error fetching total bookings:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ total: row.total });
    });
});

app.get('/inbox-preview', (req, res) => {
    const sql = `
      SELECT 
        fullName AS notificationText,
        created_at AS timestamp
      FROM Reservation
      ORDER BY created_at DESC
      LIMIT 3
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching inbox notifications:', err.message);
            return res.status(500).json({ error: 'Failed to fetch notifications' });
        }
        // Map to notification format you want
        const notifications = rows.map(row => ({
  text: `New Reservation by ${row.notificationText}`,
  timestamp: new Date(row.timestamp).toLocaleTimeString()
}));
        res.json(notifications);
    });
});

// GET route to fetch latest reservations preview
app.get('/api/reservations-preview', (req, res) => {
    const sql = `
        SELECT 
            reservationID AS ID,
            fullName AS Name,
            studID AS StudentNo,
            start_time AS TimeIn,
            end_time AS TimeOut,
            num_participants AS Pax
        FROM Reservation
        ORDER BY created_at DESC
        LIMIT 3
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching reservations preview:', err.message);
            return res.status(500).json({ error: 'Failed to fetch reservations preview' });
        }

        res.json(rows);
    });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));