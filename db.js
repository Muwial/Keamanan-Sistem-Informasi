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
      -- Document type: 'surat' or 'sertifikat'
      document_type TEXT DEFAULT 'surat',
      -- Surat fields (nullable for certificates)
      nomor_surat TEXT UNIQUE COLLATE NOCASE,
      perihal TEXT,
      penandatangan TEXT,
      jabatan_surat TEXT,
      tanggal_surat TEXT,
      -- Sertifikat fields (nullable for letters)
      nama_peserta TEXT,
      nomor_sertifikat TEXT UNIQUE COLLATE NOCASE,
      nama_penandatangan TEXT,
      jabatan_penandatangan TEXT,
      waktu_penandatangan TEXT,
      nama_instansi TEXT,
      nama_kegiatan TEXT,
      tanggal_pelaksanaan TEXT,
      -- Common fields
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
  // Add certificate-related columns
  db.run(`ALTER TABLE letters ADD COLUMN document_type TEXT DEFAULT 'surat'`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN nama_peserta TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN nomor_sertifikat TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN nama_penandatangan TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN jabatan_penandatangan TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN waktu_penandatangan TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN nama_instansi TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN nama_kegiatan TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN tanggal_pelaksanaan TEXT`, (err) => {
    // Ignore error if column already exists
  });
  // Add jabatan for surat
  db.run(`ALTER TABLE letters ADD COLUMN jabatan_surat TEXT`, (err) => {
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




