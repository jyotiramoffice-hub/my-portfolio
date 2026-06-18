const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'contacts.db');
const db = new Database(dbPath);

console.log('🔄 Initializing SQLite database at:', dbPath);

try {
  // Read and execute schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  console.log('✅ SQLite Schema initialized successfully.');

  // Check if seeding is needed (only if the table is currently empty)
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM hire_me').get().count;
  if (rowCount === 0) {
    console.log('🌱 Database is empty. Seeding data...');
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    db.exec(seed);
    console.log('✅ SQLite Database seeded successfully.');
  } else {
    console.log(`ℹ️ Database already contains ${rowCount} contact record(s). Skipping seeding.`);
  }

} catch (err) {
  console.error('❌ Database initialization error:', err.message);
  process.exit(1);
} finally {
  db.close();
}

console.log('✨ Setup complete!');
