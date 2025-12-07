const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'signatures.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor_surat TEXT NOT NULL UNIQUE COLLATE NOCASE,
      perihal TEXT NOT NULL,
      penandatangan TEXT NOT NULL,
      tanggal_surat TEXT NOT NULL,
      file_path TEXT,
      tanda_tangan_path TEXT,
      nonce TEXT NOT NULL,
      data_hash TEXT NOT NULL,
      signature_hash TEXT,
      created_at TEXT NOT NULL
    )`
  );
  
  // Add columns if they don't exist (for existing databases)
  db.run(`ALTER TABLE letters ADD COLUMN tanda_tangan_path TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN data_hash TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN signature_hash TEXT`, (err) => {
    // Ignore error if column already exists
  });
});

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

module.exports = { db, run, get, all, dbPath };




