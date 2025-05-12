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
app.use(express.static(path.join(__dirname, 'public')));

// POST route for reservation confirmation
app.post('/confirm-button', (req, res) => {
    console.log('POST request received for /confirm-button');
    console.log('Request body:', req.body);
    const { date, time, program, numStudents, students, reason = '' } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).send('Student details are required');
    }

    const [start_time, end_time] = time.split(' - ').map(str => str.trim());
    const mainStudent = students[0];
    const companionStudents = students.slice(1); // rest go to Addedstud

    const insertReservation = `
        INSERT INTO Reservation 
        (date, fullName, studID, num_participants, program, start_time, end_time, reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(insertReservation, [
        date,
        mainStudent.name,
        mainStudent.id,
        parseInt(numStudents),
        program,
        start_time,
        end_time,
        reason
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));