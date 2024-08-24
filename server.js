const express = require('express');
const mysql = require('mysql2');
const { formatDate } = require('./DateTime');

const app = express();
app.use(express.json());


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  console.log('Connected to MySQL');
  const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS contacts_db'

  connection.query(createDatabaseQuery, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('Database created or already exists');
    
    connection.query('USE contacts_db', (err) => {
      if (err) {
        console.error('Error selecting database:', err);
        return;
      }
      console.log('Using database contacts_db');
      

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          phoneNumber VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          linkedId INT,
          linkPrecedence ENUM('primary', 'secondary') NOT NULL,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          deletedAt DATETIME
        );
      `;

      connection.query(createTableQuery, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
        console.log('Table created or already exists');
      });
    });
  });
});

app.post('/identify', (req, res) => {
  const givenNumber = req.body.phoneNumber;
  const givenEmail = req.body.email;
  let oldId = null;
  let precedence = 'primary';


  const findItemQuery = `
    SELECT * FROM contacts 
    WHERE phoneNumber = ? OR email = ?;
  `;
  
  connection.query(findItemQuery, [givenNumber, givenEmail], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }

    const findItemNumber = results.find(item => item.phoneNumber === givenNumber);
    const findItemEmail = results.find(item => item.email === givenEmail);

    if (findItemNumber) {
      oldId = findItemNumber.id;
      precedence = 'secondary';
    }
    if (findItemEmail) {
      oldId = findItemEmail.id;
      precedence = 'secondary';
    }

    if (findItemNumber && findItemEmail && findItemNumber.id !== findItemEmail.id) {
      const updateQuery = `
        UPDATE contacts 
        SET linkedId = ?, linkPrecedence = 'secondary'
        WHERE phoneNumber = ?;
      `;

      connection.query(updateQuery, [findItemEmail.id, givenNumber], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database update error' });
        }
      });
    } else {
      const insertQuery = `
        INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;

      connection.query(insertQuery, [givenNumber, givenEmail, oldId, precedence, formatDate(new Date()), formatDate(new Date()), null], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database insert error' });
        }
      });
    }

    const commonQuery = `
      SELECT * FROM contacts
      WHERE phoneNumber LIKE ? OR email LIKE ?;
    `;

    connection.query(commonQuery, [`%${givenNumber}%`, `%${givenEmail}%`], (err, commonResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error' });
      }

      const primaryIds = [];
      const secondaryIds = [];
      const emails = [];
      const phoneN = [];

      commonResults.forEach(item => {
        if (item.linkPrecedence === 'primary') {
          primaryIds.push(item.id);
          emails.push(item.email);
          phoneN.push(item.phoneNumber);
        } else if (item.linkPrecedence === 'secondary') {
          secondaryIds.push(item.id);
          emails.push(item.email);
          phoneN.push(item.phoneNumber);
        }
      });

      const output = {
        contact: {
          primaryContactId: primaryIds[0] || null,
          emails: [...new Set(emails)],
          phoneNumbers: [...new Set(phoneN)],
          secondaryContactIds: secondaryIds
        }
      };

      res.status(200).json(output);
    });
  });
});

app.listen(5000, () => {
  console.log('Server Listening on port 5000');
});
