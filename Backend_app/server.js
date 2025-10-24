const express = require("express");
const mysql = require("mysql");
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
require('dotenv').config(); // This will load variables from .env file
const jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json());
const nodemailer = require("nodemailer");
const jwtSecret = process.env.JWT_SECRET;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const cron = require('node-cron');
// const cron = require("node-cron");

const twilio = require('twilio');
const bodyParser = require('body-parser');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Create a Twilio client
const client = twilio(accountSid, authToken);

app.use(bodyParser.json());

const port = process.env.PORT || 8087; // Fallback to 8082 if PORT is not set
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in the .env file");
}

const db = mysql.createConnection({
    host: 'localhost',      // Your MySQL host (e.g., localhost)
    user: "root",           // Your MySQL username (phpMyAdmin username)
    password: "", 
});

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DailyReminder', // Ensure you specify the database here

});
const pool1 = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DailyReminder',
  connectionLimit: 10, // Ensures a limit on active connections
});
const pool2 = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DailyReminder',
  connectionLimit: 10, // Ensures a limit on active connections
});

db.connect((err) => {
  if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
  }
  console.log('Connected to MySQL.');

  // Create the database if it doesn't exist
  db.query(`CREATE DATABASE IF NOT EXISTS DailyReminder`, (err) => {
      if (err) {
          console.error('Error creating database:', err);
          return;
      }
      console.log('Database "DailyReminder" created or already exists.');

      // Switch to the new database
      db.changeUser({ database: 'DailyReminder' }, (err) => {
          if (err) {
              console.error('Error switching to database:', err);
              return;
          }
          console.log('Using database "DailyReminder".');

          // Create the users table
          const createUsersTable = `
              CREATE TABLE IF NOT EXISTS users (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(100) NOT NULL,
                  email VARCHAR(100) NOT NULL UNIQUE,
                  password VARCHAR(255) NOT NULL,
                  login BOOLEAN DEFAULT FALSE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              )
          `;

          db.query(createUsersTable, (err) => {
              if (err) {
                  console.error('Error creating "users" table:', err);
                  return;
              }
              console.log('Table "users" created or already exists.');

              // Create the reminders table
              const createRemindersTable = `
                  CREATE TABLE IF NOT EXISTS reminders (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      user_id INT NOT NULL,
                      title VARCHAR(1000) NOT NULL,
                      description VARCHAR(1000) NOT NULL,
                      type VARCHAR(1000) NOT NULL,
                      reminder_time DATETIME NOT NULL,
                      sent BOOLEAN DEFAULT FALSE,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                  )
              `;

              db.query(createRemindersTable, (err) => {
                  if (err) {
                      console.error('Error creating "reminders" table:', err);
                      return;
                  }
                  console.log('Table "reminders" created or already exists.');
              });

              // Create the settings table
              const createSettingsTable = `
                  CREATE TABLE IF NOT EXISTS settings (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      user_id INT NOT NULL,
                      Language VARCHAR(100) NOT NULL,
                      theme VARCHAR(1000) NOT NULL,
                      notification BOOLEAN DEFAULT FALSE,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                  )
              `;

              db.query(createSettingsTable, (err) => {
                  if (err) {
                      console.error('Error creating "settings" table:', err);
                      return;
                  }
                  console.log('Table "settings" created or already exists.');

                  // Close the connection
                  db.end((err) => {
                      if (err) {
                          console.error('Error closing the connection:', err);
                      } else {
                          console.log('Connection closed.');
                      }
                  });
              });
          });
      });
  });
});


app.get('/initialize-database', (req, res) => {
  res.json({ message: 'Database and table initialized successfully!' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer schema

  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });

    req.user = user; // Attach decoded user info to the request object
    next();
  });
}


app.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const checkEmailSql = "SELECT * FROM users WHERE email = ?";
    pool.query(checkEmailSql, [email], async (err, results) => {
      if (err) {
        console.error('Error checking email:', err);
        return res.status(500).json({ message: 'Error checking email' });
      }

      // If email already exists, return a response
      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // If email is not found, hash the password and insert new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())";
      const values = [name, email, hashedPassword, phone];

      pool.query(sql, values, (err, data) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ message: 'Error creating user' });
        }
        return res.status(201).json({ message: 'User created successfully', userId: data.insertId });
      });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).json({ message: 'Error creating user' });
  }
});


app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const checkEmailSql = "SELECT * FROM users WHERE email = ?";
    
    pool.query(checkEmailSql, [email], async (err, results) => {
      if (err) {
        console.error('Database query error (checkEmailSql):', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (results.length === 0) {
        console.warn('No user found with the provided email:', email);
        return res.status(404).json({ message: 'Invalid email or password' });
      }

      const user = results[0];

      try {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          console.warn('Invalid password for email:', email);
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last_login timestamp or login status
        const updateLastLoginSql = "UPDATE users SET login = TRUE WHERE id = ?";
        pool.query(updateLastLoginSql, [user.id], (err) => {
          if (err) {
            console.error('Database query error (updateLastLoginSql):', err);
            return res.status(500).json({ message: 'Error updating login status' });
          }

          // Generate JWT Token
          const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload
            jwtSecret, // Secret key
            { expiresIn: '10h' } // Token expiry
          );

          console.log('Signin successful for user:', email);

          return res.status(200).json({
            message: 'Signin successful',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
          });
        });
      } catch (bcryptErr) {
        console.error('Error during password comparison:', bcryptErr);
        return res.status(500).json({ message: 'Internal server error' });
      }
    });
  } catch (err) {
    console.error('Unexpected error during signin:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/addReminders', authenticateToken, (req, res) => {
  console.log("Received request to add reminder");
  const { title, description, type, reminder_time } = req.body;

  // Log the reminder_time to verify its value
  console.log("Received reminder_time:", reminder_time);

  // Validate reminder_time
  if (!reminder_time || isNaN(new Date(reminder_time).getTime())) {
    console.error("Invalid reminder_time:", reminder_time);
    return res.status(400).json({ error: 'Invalid reminder_time' });
  }

  // Convert the ISO string to a format suitable for the database
  // const formattedReminderTime = new Date(reminder_time)
  //   .toISOString()
  //   .slice(0, 19)
  //   .replace('T', ' ');

    const [datePart, timePart] = reminder_time.split('T');
const formattedReminderTime = `${datePart} ${timePart}:00`;

  // Log the formatted reminder_time
  console.log("Formatted reminder_time:", formattedReminderTime);

  const getIdQuery = 'SELECT id FROM users WHERE login = 1';

  pool.query(getIdQuery, (error, results) => {
    if (error) {
      console.error('Error fetching user ID:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const userId = results[0].id;

      const insertQuery = `
        INSERT INTO reminders (user_id, title, description, type, reminder_time, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const values = [userId, title, description, type, formattedReminderTime];

      pool.query(insertQuery, values, (insertError, insertResults) => {
        if (insertError) {
          console.error('Error inserting reminder:', insertError);
          return res.status(500).json({ error: 'Database insert error' });
        }

        res.json({ message: 'Reminder added successfully', reminderId: insertResults.insertId });
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});


app.get('/getReminders', authenticateToken, (req, res) => {
  console.log("Received request to get reminders");

  // Query to join reminders with users table based on login = 1
  const getRemindersQuery = `
    SELECT u.name ,r.id,r.user_id, r.title, r.description, r.type, r.reminder_time, r.created_at
    FROM reminders r
    JOIN users u ON r.user_id = u.id
    WHERE u.login = 1
  `;

  pool.query(getRemindersQuery, (error, results) => {
    if (error) {
      console.error('Error fetching reminders:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.json({ reminders: results });
    } else {
      res.status(404).json({ message: 'No reminders found for user with login = 1' });
    }
    console.log( results )
  });
});



app.post('/logout', (req, res) => {
  const getLoggedInUserSql = "SELECT id FROM users WHERE login = 1 LIMIT 1";
  const updateLogoutSql = "UPDATE users SET login = 0 WHERE id = ?";

  // First, retrieve the user ID where login is 1
  pool.query(getLoggedInUserSql, (err, results) => {
    if (err) {
      console.error('Error retrieving logged-in user:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No logged-in user found' });
    }

    const userId = results[0].id;

    // Then, update the user's login status to 0
    pool.query(updateLogoutSql, [userId], (err, updateResults) => {
      if (err) {
        console.error('Error updating login status during logout:', err);
        return res.status(500).json({ message: 'Error during logout' });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log(`User with ID ${userId} logged out successfully`);
      return res.status(200).json({ message: 'Logout successful', userId });
    });
  });
});

app.delete('/deleteReminder/:id', authenticateToken, (req, res) => {
  console.log("Received request to delete reminder");
  const reminderId = req.params.id;
  

  // Log the reminder ID to verify
  console.log("Received reminder ID:", reminderId);

  // Validate reminderId
  if (!reminderId || isNaN(reminderId)) {
    console.error("Invalid reminder ID:", reminderId);
    return res.status(400).json({ error: 'Invalid reminder ID' });
  }

  // First, get the user ID
  const getIdQuery = 'SELECT id FROM users WHERE login = 1';
  
  pool.query(getIdQuery, (error, results) => {
    if (error) {
      console.error('Error fetching user ID:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const userId = results[0].id;

      // Delete query ensuring the reminder belongs to the user
      const deleteQuery = `
        DELETE FROM reminders 
        WHERE id = ? AND user_id = ?
      `;
      const values = [reminderId, userId];

      pool.query(deleteQuery, values, (deleteError, deleteResults) => {
        if (deleteError) {
          console.error('Error deleting reminder:', deleteError);
          return res.status(500).json({ error: 'Database delete error' });
        }

        if (deleteResults.affectedRows === 0) {
          return res.status(404).json({ error: 'Reminder not found or not authorized' });
        }

        res.json({ message: 'Reminder deleted successfully' });
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});


app.put('/updateReminder/:reminder_id', authenticateToken, (req, res) => {
 
  const { title, description, type, reminder_time } = req.body;
  const { reminder_id } = req.params;

  // Log received data
  console.log("Reminder ID:", reminder_id);
  console.log("Received reminder_time:", reminder_time);

  // Validate reminder_time
  if (!reminder_time || isNaN(new Date(reminder_time).getTime())) {
    console.error("Invalid reminder_time:", reminder_time);
    return res.status(400).json({ error: 'Invalid reminder_time' });
  }

  // Convert the ISO string to MySQL datetime format
  const formattedReminderTime = new Date(reminder_time)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  console.log("Formatted reminder_time:", formattedReminderTime);

  const getUserIdQuery = 'SELECT id FROM users WHERE login = 1';

  pool.query(getUserIdQuery, (error, results) => {
    if (error) {
      console.error('Error fetching user ID:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      const userId = results[0].id;

      const updateQuery = `
        UPDATE reminders 
        SET title = ?, description = ?, type = ?, reminder_time = ?
        WHERE id = ? AND user_id = ?
      `;
      const values = [title, description, type, formattedReminderTime, reminder_id, userId];

      pool.query(updateQuery, values, (updateError, updateResults) => {
        if (updateError) {
          console.error('Error updating reminder:', updateError);
          return res.status(500).json({ error: 'Database update error' });
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).json({ message: 'Reminder not found or no changes made' });
        }

        res.json({ message: 'Reminder updated successfully' });
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // Correct, this is the full hostname
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;
  
  // For debugging only - remove in production
  console.log("Email user:", process.env.EMAIL_USER);
  console.log("Email pass is set:", !!process.env.EMAIL_PASS);

  const mailOptions = {
    from: process.env.EMAIL_USER, // Use environment variable instead of hardcoding
    to: "mariatannous86@gmail.com",
    subject: "New Contact Form Message",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };
console.log(mailOptions)
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ success: false, message: "Email failed to send" });
  }
});



app.post('/save-settings', async (req, res) => {
  const { userId: reqUserId, language, theme, notification } = req.body;

  try {
    const getIdQuery = 'SELECT id FROM users WHERE login = 1';

    pool.query(getIdQuery, (error, results) => {
      if (error) {
        console.error('Error fetching user ID:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userId = results[0].id;
      console.log(userId)
      const settingExistQuery = 'SELECT id FROM settings WHERE user_id = ?';
      pool.query(settingExistQuery, [userId], (settingError, settingRows) => {
        if (settingError) {
          console.error('Error checking settings:', settingError);
          return res.status(500).json({ error: 'Database error' });
        }

        if (settingRows.length > 0) {
          // Update existing settings
          const updateQuery = `
            UPDATE settings 
            SET language = ?, theme = ?, notification = ?
            WHERE user_id = ?
          `;
          const updateValues = [language, theme, notification, userId];

          pool.query(updateQuery, updateValues, (updateError, updateResults) => {
            if (updateError) {
              console.error('Error updating settings:', updateError);
              return res.status(500).json({ error: 'Database update error' });
            }

            res.json({ message: 'Settings updated successfully' });
          });
        } else {
          // Insert new settings
          const insertQuery = `
            INSERT INTO settings (user_id, language, theme, notification, created_at)
            VALUES (?, ?, ?, ?, NOW())
          `;
          const insertValues = [userId, language, theme, notification];

          pool.query(insertQuery, insertValues, (insertError, insertResults) => {
            if (insertError) {
              console.error('Error inserting settings:', insertError);
              return res.status(500).json({ error: 'Database insert error' });
            }

            res.json({ message: 'Settings added successfully', settingsId: insertResults.insertId });
          });
        }
      });
    });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API endpoint to get settings
app.get('/get-settings', async (req, res) => {
  
  const getRemindersQuery = `
  SELECT u.name ,s.id,s.user_id, s.language, s.theme, s.notification, s.created_at
  FROM settings s
  JOIN users u ON s.user_id = u.id
  WHERE u.login = 1
`;

pool.query(getRemindersQuery, (error, results) => {
  if (error) {
    console.error('Error fetching reminders:', error);
    return res.status(500).json({ error: 'Database error' });
  }
console.log(results)
  if (results.length > 0) {
    res.json({ reminders: results });
  } else {
    res.status(404).json({ message: 'No reminders found for user with login = 1' });
  }
  console.log( results )
});
});
// app.post('/send-sms', (req, res) => {
//   const { to, body } = req.body;

//   // Validate input
//   if (!to || !body) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//   }

//   // Send the SMS
//   client.messages.create({
//       body: body,
//       to: to, // The recipient's phone number
//       from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
//   })
//   .then(message => {
//       res.json({ message: 'SMS sent successfully', sid: message.sid });
//   })
//   .catch(error => {
//       res.status(500).json({ error: error.message });
//   });
// });

const processingReminders = new Set();

// Schedule a job to check for due reminders every second
cron.schedule('* * * * * *', () => { // Six asterisks for seconds
  checkAndSendReminders();

});

async function checkAndSendReminders() {
  try {
  //  console.log("maria hello")
    // Get current time in MySQL format
    const now = new Date();
    const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
                        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    // console.log(currentTime)

    // Query to get all reminders that are due and not sent
    const query = `
    SELECT r.id, r.title, r.description, r.type, r.reminder_time, u.email, u.name 
    FROM reminders r
    JOIN users u ON r.user_id = u.id
    JOIN settings s ON s.user_id = r.user_id
    WHERE r.reminder_time <= ? 
      AND r.sent = FALSE
      AND s.notification = TRUE
    LIMIT 10
  `;
   
    pool.query(query, [currentTime], async (error, results) => {
      // console.log(results)
      if (error) {
        console.error('Error fetching due reminders:', error);
        return;
      }
      // console.log(results)
      if (results.length === 0) {
        return; // No reminders to process
      }

      // Process each reminder
      for (const reminder of results) {
        // Skip if already being processed
        if (processingReminders.has(reminder.id)) {
          continue;
        }

        // Mark as being processed
        processingReminders.add(reminder.id);

        try {
          // Send email
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reminder.email,
            subject: `Reminder: ${reminder.title}`,
            html: `
              <h2>Hello ${reminder.name},</h2>
              <p>This is a reminder for: <strong>${reminder.title}</strong></p>
              <p>Details: ${reminder.description}</p>
              <p>Type: ${reminder.type}</p>
              <p>Scheduled time: ${new Date(reminder.reminder_time).toLocaleString()}</p>
              <p>Thank you for using DailyReminder!</p>
            `
          };

          await transporter.sendMail(mailOptions);
          console.log(`[${new Date().toISOString()}] Email sent for reminder ${reminder.id} to ${reminder.email}`);

          // Update the reminder as sent
          const updateQuery = 'UPDATE reminders SET sent = TRUE WHERE id = ?';
          await new Promise((resolve, reject) => {
            pool.query(updateQuery, [reminder.id], (updateError) => {
              if (updateError) {
                console.error(`Error updating reminder ${reminder.id}:`, updateError);
                reject(updateError);
              } else {
                console.log(`Marked reminder ${reminder.id} as sent`);
                resolve();
              }
            });
          });
        } catch (emailError) {
          console.error(`Failed to process reminder ${reminder.id}:`, emailError);
        } finally {
          // Remove from processing set
          processingReminders.delete(reminder.id);
        }
      }
    });
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
}

app.get('/user-count', authenticateToken, (req, res) => {
  console.log("Received request to get user count");

  // Query to count all users
  const countUsersQuery = `
    SELECT COUNT(*) AS user_count
    FROM users
  `;

  pool.query(countUsersQuery, (error, results) => {
    if (error) {
      console.error('Error counting users:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // The count will be in results[0].user_count
    const userCount = results[0].user_count;
    res.json({ count: userCount });
    
    console.log(`Total users count: ${userCount}`);
  });
});

app.get('/eventD-count', authenticateToken, (req, res) => {
  console.log("Received request to get user count");

  // Query to count all users
  const eventDQuery = `
     SELECT r.type, COUNT(*) AS count FROM reminders r JOIN users u ON r.user_id = u.id WHERE u.login = 1 GROUP BY type;
  `;

 pool.query(eventDQuery, (error, results) => {
    if (error) {
      console.error('Error counting reminders by type:', error);
      return res.status(500).json({ error: 'Database error' });
    }
 console.log(`results eventD: ${results}`);

    res.json({ counts: results });
    
   
  });
});

app.get('/YearlyR-count', authenticateToken, (req, res) => {
  console.log("Received request to get user count");

  // Query to count all users
  const YearlyRQuery = `
    SELECT COUNT(*) AS reminder_count 
FROM reminders 
WHERE YEAR(created_at) = YEAR(CURDATE());
  `;

 pool.query(YearlyRQuery, (error, results) => {
    if (error) {
      console.error('Error counting reminders by type:', error);
      return res.status(500).json({ error: 'Database error' });
    }
 console.log(`results YearlyR: ${results}`);

    res.json({ year: results });
    
   
  });
});

app.get('/DailyR-count', authenticateToken, (req, res) => {
  console.log("Received request to get user count");

  // Query to count all users
  const YearlyRQuery = `
SELECT 
  COUNT(*) AS reminder_count
FROM reminders
WHERE DATE(created_at) = CURDATE();
  `;

 pool.query(YearlyRQuery, (error, results) => {
    if (error) {
      console.error('Error counting reminders by type:', error);
      return res.status(500).json({ error: 'Database error' });
    }
 console.log(`results DailyR: ${results}`);

    res.json({ day: results });
    
   
  });
});

const PORT = 8082;
app.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});