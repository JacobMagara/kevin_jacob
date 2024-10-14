// Import necessary modules
const express = require('express'); 
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv'); 
const session = require('express-session');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();
const port = 3000;

// Middleware to parse URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// Configure session middleware
app.use(session({
    key: 'session_cookie_name',
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Create a MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.log("Error connecting to the database!", err.message);
    } else {
        console.log("Database connected successfully!");
    }
});

// Create the 'users' table if it does not already exist
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE
    )`;

db.query(createUsersTable, (err) => {
    if (err) {
        console.log("Error creating users table!", err.message);
    } else {
        console.log("Users table created or already exists.");
    }
});

// Create the 'incidences' table if it does not already exist
const createIncidenceTable = `
    CREATE TABLE IF NOT EXISTS incidences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        disease_name VARCHAR(100) NOT NULL,
        date_reported DATE NOT NULL,
        location VARCHAR(100) NOT NULL,
        number_of_cases INT NOT NULL,
        number_of_deaths INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;

db.query(createIncidenceTable, (err) => {
    if (err) {
        console.log("Error creating incidences table!", err.message);
    } else {
        console.log("Incidences table created or already exists.");
    }
});

// Create the 'vaccinations' table if it does not already exist
const createVaccinationTable = `
    CREATE TABLE IF NOT EXISTS vaccinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        disease_name VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        date_of_vaccination DATE NOT NULL,
        number_of_vaccinated INT NOT NULL,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;

db.query(createVaccinationTable, (err) => {
    if (err) {
        console.log("Error creating vaccinations table!", err.message);
    } else {
        console.log("Vaccinations table created or already exists.");
    }
});

// Handle user registration (POST /register)
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check for missing fields
        if (!username || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert the new user
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const values = [username, email, hashedPassword];

        // Insert the user into the database
        db.query(sql, values, (err) => {
            if (err) {
                console.log("Error inserting user into the database:", err.message);
                return res.status(500).send('Error registering user');
            }
            // Redirect to the login page after successful registration
            res.redirect('/login');
        });
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Handle user login (POST /login)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('All fields are required');
        }

        // SQL query to find the user by email
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.log("Error querying the database:", err.message);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length === 0) {
                return res.status(400).send('User not found');
            }

            const user = results[0];

            // Compare password with the hashed password stored in the database
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(400).send('Incorrect password');
            }

            // Store user information in the session
            req.session.userId = user.id;
            res.redirect('/home');
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).send('Internal Server Error');
    }
});

// // Route to add a vaccination/incidence with user ID (POST /api/expenses/add)
// app.post('/api/add_data', (req, res) => {
//     const { user_id, type, disease_name, location, number_of_cases, number_of_deaths, number_vaccinated } = req.body;

//     let sql;
//     let values;

//     if (type === 'incident') {
//         sql = 'INSERT INTO incidences (user_id, disease_name, location, date_reported, number_of_cases, number_of_deaths) VALUES (?, ?, ?, NOW(), ?, ?)';
//         values = [user_id, disease_name, location, number_of_cases, number_of_deaths];
//     } else if (type === 'vaccination') {
//         sql = 'INSERT INTO vaccinations (user_id, disease_name, location, date_of_vaccination, number_of_vaccinated) VALUES (?, ?, ?, NOW(), ?)';
//         values = [user_id, disease_name, location, number_vaccinated];
//     } else {
//         return res.status(400).send('Invalid type');
//     }

//     db.query(sql, values, (err) => {
//         if (err) {
//             console.log("Error inserting record into the database:", err.message);
//             return res.status(500).send('Error adding record');
//         }
//         res.status(200).send({ success: true });
//     });
// });

// POST route to handle adding new incident or vaccination record
app.post('/api/add_data', (req, res) => {
    const { user_id, type, disease_name, location, number_of_cases, number_of_deaths, number_vaccinated } = req.body;

    let sql;
    let values;

    // Handle incident type
    if (type === 'incident') {
        sql = `
            INSERT INTO incidences (user_id, disease_name, location, date_reported, number_of_cases, number_of_deaths) 
            VALUES (?, ?, ?, NOW(), ?, ?)
        `;
        values = [user_id, disease_name, location, number_of_cases, number_of_deaths || 0]; // Default deaths to 0 if not provided
    } 
    // Handle vaccination type
    else if (type === 'vaccination') {
        sql = `
            INSERT INTO vaccinations (user_id, disease_name, location, date_of_vaccination, number_of_vaccinated) 
            VALUES (?, ?, ?, NOW(), ?)
        `;
        values = [user_id, disease_name, location, number_vaccinated];
    } 
    // Handle invalid type
    else {
        return res.status(400).json({ error: 'Invalid type specified' });
    }

    // Execute the SQL query
    db.query(sql, values, (err) => {
        if (err) {
            console.error("Error inserting record into the database:", err.message);
            return res.status(500).json({ error: 'Error adding record to the database' });
        }
        res.status(200).json({ success: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully.` });
    });
});


// // Route to view incidence/vaccination by user ID (GET /api/expenses/view/:user_id)
// app.get('/api/expenses/view/:user_id', (req, res) => {
//     const { user_id } = req.params;

//     const incidentsSql = 'SELECT * FROM incidences WHERE user_id = ?';
//     const vaccinationsSql = 'SELECT * FROM vaccinations WHERE user_id = ?';

//     db.query(incidentsSql, [user_id], (err, incidents) => {
//         if (err) {
//             console.log("Error retrieving incidences:", err.message);
//             return res.status(500).send('Error retrieving incidences');
//         }

//         db.query(vaccinationsSql, [user_id], (err, vaccinations) => {
//             if (err) {
//                 console.log("Error retrieving vaccinations:", err.message);
//                 return res.status(500).send('Error retrieving vaccinations');
//             }

//             res.status(200).send({
//                 incidents,
//                 vaccinations
//             });
//         });
//     });
// });

// Route to view both incidence and vaccination by user ID (GET /api/view_data/:user_id)
// Route to view both incidences and vaccinations by user ID (GET /api/view_data/:user_id)
app.get('/api/view_data/:user_id', (req, res) => {
    const { user_id } = req.params;

    const incidentsSql = 'SELECT disease_name, location, date_reported, number_of_cases, number_of_deaths FROM incidences WHERE user_id = ?';
    const vaccinationsSql = 'SELECT disease_name, location, date_of_vaccination, number_of_vaccinated FROM vaccinations WHERE user_id = ?';

    // First, query incidences
    db.query(incidentsSql, [user_id], (err, incidences) => {
        if (err) {
            console.log("Error retrieving incidences:", err.message);
            return res.status(500).send('Error retrieving incidences');
        }

        // Then, query vaccinations
        db.query(vaccinationsSql, [user_id], (err, vaccinations) => {
            if (err) {
                console.log("Error retrieving vaccinations:", err.message);
                return res.status(500).send('Error retrieving vaccinations');
            }

            // Send separate arrays for incidences and vaccinations
            res.status(200).json({
                incidences: incidences,
                vaccinations: vaccinations
            });
        });
    });
});


// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Serve public files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
