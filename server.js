const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'contacts.db'));

// Ensure SQLite table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS hire_me (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced INTEGER DEFAULT 0
  )
`);

// MySQL Pool config (using environment variables for production)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'jyotiram-9552761943',
  database: process.env.DB_NAME || 'jyoti',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true
});

// Test connection and auto-create table in MySQL
pool.query('SELECT DATABASE() as db')
  .then(([r]) => {
    console.log('✅ Connected to MySQL DB:', r[0].db);
    pool.query(`
      CREATE TABLE IF NOT EXISTS hire_me (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).then(() => {
      console.log('✅ Verified MySQL table "hire_me" structure');
      // Run an initial sync on start
      syncToMySQL().catch(e => console.error('⚠️ Startup sync failed:', e.message));
    }).catch(e => console.error('❌ Failed to verify/create MySQL table:', e.message));
  })
  .catch(e => console.error('❌ MySQL DB Error:', e.message));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Replication helper function: Syncs SQLite records (where synced = 0) to MySQL
async function syncToMySQL() {
  console.log('🔄 Checking for unsynced contacts...');
  try {
    const unsyncedRows = db.prepare('SELECT * FROM hire_me WHERE synced = 0').all();
    if (unsyncedRows.length === 0) {
      console.log('✅ All contacts are already synced to MySQL.');
      return { success: true, count: 0 };
    }

    console.log(`🔄 Found ${unsyncedRows.length} unsynced contact(s). Syncing...`);
    let syncedCount = 0;

    for (const row of unsyncedRows) {
      try {
        await pool.query(
          `INSERT INTO hire_me (id, name, email, subject, message, created_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             email = VALUES(email),
             subject = VALUES(subject),
             message = VALUES(message),
             created_at = VALUES(created_at)`,
          [row.id, row.name, row.email, row.subject, row.message, row.created_at]
        );
        db.prepare('UPDATE hire_me SET synced = 1 WHERE id = ?').run(row.id);
        syncedCount++;
      } catch (err) {
        console.error(`❌ Sync error for ID ${row.id}:`, err.message);
      }
    }
    console.log(`✅ Synced ${syncedCount} of ${unsyncedRows.length} contacts to MySQL.`);
    return { success: true, count: syncedCount };
  } catch (err) {
    console.error('❌ Sync process failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Save contact
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message)
    return res.status(400).json({ error: 'All fields required' });

  try {
    // 1. Save to SQLite
    const stmt = db.prepare('INSERT INTO hire_me (name, email, subject, message, synced) VALUES (?, ?, ?, ?, 0)');
    const info = stmt.run(name, email, subject, message);
    const newId = info.lastInsertRowid;
    console.log('✅ Inserted into SQLite ID:', newId);

    // 2. Try to sync to MySQL
    let mysqlSynced = 0;
    try {
      const row = db.prepare('SELECT * FROM hire_me WHERE id = ?').get(newId);
      await pool.query(
        `INSERT INTO hire_me (id, name, email, subject, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           email = VALUES(email),
           subject = VALUES(subject),
           message = VALUES(message),
           created_at = VALUES(created_at)`,
        [row.id, row.name, row.email, row.subject, row.message, row.created_at]
      );
      db.prepare('UPDATE hire_me SET synced = 1 WHERE id = ?').run(newId);
      mysqlSynced = 1;
      console.log('✅ Synced to MySQL ID:', newId);
    } catch (mysqlErr) {
      console.error(`⚠️ Failed to sync to MySQL for ID ${newId}:`, mysqlErr.message);
    }

    res.json({ success: true, id: newId, synced: mysqlSynced });
  } catch (err) {
    console.error('❌ SQLite Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all contacts (admin)
app.get('/api/contacts', (req, res) => {
  try {
    // Retrieve all contacts from SQLite
    const rows = db.prepare('SELECT * FROM hire_me ORDER BY created_at DESC').all();
    
    // Background sync in case MySQL connection was restored
    syncToMySQL().catch(e => console.error('Background sync failed:', e.message));
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Delete from SQLite
    db.prepare('DELETE FROM hire_me WHERE id = ?').run(id);
    console.log(`✅ Deleted from SQLite: ID ${id}`);

    // 2. Delete from MySQL
    try {
      await pool.query('DELETE FROM hire_me WHERE id = ?', [id]);
      console.log(`✅ Deleted from MySQL: ID ${id}`);
    } catch (mysqlErr) {
      console.error(`⚠️ Failed to delete from MySQL for ID ${id}:`, mysqlErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual Sync trigger
app.post('/api/sync', async (req, res) => {
  const result = await syncToMySQL();
  if (result.success) {
    res.json({ success: true, count: result.count });
  } else {
    res.status(500).json({ error: result.error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
