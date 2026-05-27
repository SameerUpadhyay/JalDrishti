import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// MySQL connection parameters
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306')
};

let pool;

async function initDb() {
  try {
    // 1. Connect without database to create it if it doesn't exist
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS jaldrishti`);
    await connection.end();

    // 2. Create connection pool with database specified
    pool = mysql.createPool({
      ...dbConfig,
      database: 'jaldrishti',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Connected to MySQL database "jaldrishti".');

    // 3. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tankers (
        id VARCHAR(50) PRIMARY KEY,
        ward VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        eta VARCHAR(50),
        type VARCHAR(50) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id VARCHAR(50) PRIMARY KEY,
        area VARCHAR(100) NOT NULL,
        volume INT NOT NULL,
        waitTime VARCHAR(50),
        priority VARCHAR(50),
        addressDetails TEXT,
        phone VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        trackingId VARCHAR(50) UNIQUE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS anomalies (
        id VARCHAR(50) PRIMARY KEY,
        icon VARCHAR(100),
        type VARCHAR(150) NOT NULL,
        location VARCHAR(150) NOT NULL,
        time VARCHAR(50),
        severity VARCHAR(50) NOT NULL,
        severityColor VARCHAR(50) NOT NULL,
        trackingId VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        assignedTankerId VARCHAR(50)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id VARCHAR(50) PRIMARY KEY,
        requestId VARCHAR(50) NOT NULL,
        rating INT NOT NULL,
        comments TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Routes

// Get all tankers
app.get('/api/tankers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tankers');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tankers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM requests ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all anomalies
app.get('/api/anomalies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM anomalies ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
  }
});

// Get all operators
app.get('/api/operators', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM operators');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM feedback ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create new citizen request
app.post('/api/requests', async (req, res) => {
  const { area, volume, urgency, addressDetails, phone, status, trackingId } = req.body;
  
  if (!area || !volume || !phone || !trackingId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Map urgency (Normal/High/Critical) to priority (low/medium/high) and setup a default wait time
  let priority = 'low';
  let waitTime = '1h 30m';
  if (urgency === 'High') {
    priority = 'medium';
    waitTime = '45m';
  } else if (urgency === 'Critical') {
    priority = 'high';
    waitTime = '15m';
  }

  const generatedId = `REQ-${Math.floor(100 + Math.random() * 900)}`;

  try {
    await pool.query(
      `INSERT INTO requests (id, area, volume, waitTime, priority, addressDetails, phone, status, trackingId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generatedId, area, volume, waitTime, priority, addressDetails || '', phone, status || 'Pending', trackingId]
    );
    res.status(201).json({ id: generatedId, trackingId, status: status || 'Pending' });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create new anomaly (complaint)
app.post('/api/anomalies', async (req, res) => {
  const { type, location, severity, severityColor, icon, trackingId } = req.body;

  if (!type || !location || !severity || !trackingId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const generatedId = `ALR-${Math.floor(8000 + Math.random() * 2000)}`;

  try {
    await pool.query(
      `INSERT INTO anomalies (id, icon, type, location, time, severity, severityColor, trackingId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [generatedId, icon || '', type, location, 'Just now', severity, severityColor, trackingId]
    );
    res.status(201).json({ id: generatedId, trackingId });
  } catch (error) {
    console.error('Error creating anomaly:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Developer Seed Route
app.post('/api/seed', async (req, res) => {
  const { tankers, requests, anomalies, operators, feedback } = req.body;

  if (!tankers || !requests || !anomalies) {
    return res.status(400).json({ error: 'Invalid seed payload' });
  }

  const defaultOperators = operators || [
    { id: 'OP-101', name: 'Rajesh Kumar', phone: '+91 98765 43210', status: 'Active', assignedTankerId: 'TK-402' },
    { id: 'OP-102', name: 'Amit Patel', phone: '+91 87654 32109', status: 'Active', assignedTankerId: 'TK-891' },
    { id: 'OP-103', name: 'Suresh Ray', phone: '+91 76543 21098', status: 'On Duty', assignedTankerId: 'TK-221' },
    { id: 'OP-104', name: 'Vijay Singh', phone: '+91 65432 10987', status: 'Inactive', assignedTankerId: null },
    { id: 'OP-105', name: 'Ramesh Gowda', phone: '+91 95432 87654', status: 'Active', assignedTankerId: 'TK-112' }
  ];

  const defaultFeedback = feedback || [
    { id: 'FB-501', requestId: 'REQ-092', rating: 5, comments: 'Excellent service, delivery was quick and driver was very helpful!' },
    { id: 'FB-502', requestId: 'REQ-093', rating: 4, comments: 'Good delivery response, but water volume was slightly less than ordered.' },
    { id: 'FB-503', requestId: 'REQ-094', rating: 3, comments: 'Water tanker arrived later than estimated, but overall satisfied.' }
  ];

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Clear existing data
    await connection.query('DELETE FROM tankers');
    await connection.query('DELETE FROM requests');
    await connection.query('DELETE FROM anomalies');
    await connection.query('DELETE FROM operators');
    await connection.query('DELETE FROM feedback');

    // 2. Insert tankers
    for (const tanker of tankers) {
      await connection.query(
        'INSERT INTO tankers (id, ward, status, eta, type) VALUES (?, ?, ?, ?, ?)',
        [tanker.id, tanker.ward, tanker.status, tanker.eta || null, tanker.type]
      );
    }

    // 3. Insert requests
    for (const r of requests) {
      await connection.query(
        'INSERT INTO requests (id, area, volume, waitTime, priority, addressDetails, phone, status, trackingId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [r.id, r.area, parseInt(r.volume), r.waitTime, r.priority, '', '', 'Pending', r.id]
      );
    }

    // 4. Insert anomalies
    for (const a of anomalies) {
      await connection.query(
        'INSERT INTO anomalies (id, icon, type, location, time, severity, severityColor, trackingId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [a.id, a.icon || '', a.type, a.location, a.time, a.severity, a.severityColor, a.id]
      );
    }

    // 5. Insert operators
    for (const op of defaultOperators) {
      await connection.query(
        'INSERT INTO operators (id, name, phone, status, assignedTankerId) VALUES (?, ?, ?, ?, ?)',
        [op.id, op.name, op.phone, op.status, op.assignedTankerId || null]
      );
    }

    // 6. Insert feedback
    for (const fb of defaultFeedback) {
      await connection.query(
        'INSERT INTO feedback (id, requestId, rating, comments) VALUES (?, ?, ?, ?)',
        [fb.id, fb.requestId, fb.rating, fb.comments]
      );
    }

    await connection.commit();
    res.json({ message: 'Database successfully seeded with mock data' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Start Server after DB check
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
});
