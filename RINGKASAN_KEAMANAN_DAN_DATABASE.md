# 📊 RINGKASAN KEAMANAN & DATABASE
## Bahan Presentasi PPT - Sistem Verifikasi Tanda Tangan Digital

---

## 🔒 BAGIAN 1: KEAMANAN SISTEM

### 1.1 Input Validation & Sanitization

#### Client-Side Validation
- ✅ **HTML5 Form Validation**
  - Required fields untuk semua input wajib
  - Type validation (date, text)
  - Pattern matching
  - Real-time feedback

- ✅ **JavaScript Validation**
  - Validasi sebelum submit form
  - Cek duplikasi nomor surat secara real-time
  - Preview file sebelum upload
  - Error handling yang user-friendly

#### Server-Side Validation
- ✅ **Express-Validator**
  - Validasi semua field dengan `body()` dan `query()`
  - Type checking: string, integer, UUID, ISO8601 date
  - Custom validators untuk format khusus
  - Sanitization untuk mencegah XSS (Cross-Site Scripting)

**Contoh Implementasi:**
```javascript
[
  body('nomor_surat').trim().notEmpty().withMessage('Nomor surat wajib diisi'),
  body('perihal').trim().notEmpty().withMessage('Perihal wajib diisi'),
  body('penandatangan').trim().notEmpty().withMessage('Nama penandatangan wajib diisi'),
  body('tanggal_surat').trim().notEmpty().isISO8601().withMessage('Tanggal tidak valid'),
  query('id').isInt({ gt: 0 }).withMessage('ID tidak valid'),
  query('nonce').isUUID().withMessage('Nonce tidak valid'),
]
```

**Sanitization Function:**
```javascript
const sanitize = (value = '') =>
  String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
```

---

### 1.2 File Upload Security

#### File Type Validation
- ✅ **PDF Surat**: Hanya `application/pdf` yang diterima
- ✅ **Tanda Tangan**: Hanya `image/jpeg`, `image/jpg`, `image/png`
- ✅ **Rejection**: File dengan tipe tidak sesuai langsung ditolak

**Implementasi:**
```javascript
fileFilter: (req, file, cb) => {
  if (file.fieldname === 'file') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Hanya file PDF yang diperbolehkan'));
    }
  } else if (file.fieldname === 'tanda_tangan') {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Hanya file JPG atau PNG yang diperbolehkan'));
    }
  }
  cb(null, true);
}
```

#### File Size Limits
- ✅ **PDF**: Maksimal 5MB (`5 * 1024 * 1024` bytes)
- ✅ **Tanda Tangan**: Maksimal 2MB (`2 * 1024 * 1024` bytes)
- ✅ **Rejection**: File melebihi limit langsung ditolak

#### File Naming Security
- ✅ **Sanitization**: Remove special characters dari filename
- ✅ **Timestamp Prefix**: Menambahkan timestamp untuk uniqueness
- ✅ **Safe Storage**: File disimpan dengan nama yang aman

**Implementasi:**
```javascript
filename: (req, file, cb) => {
  const safeName = file.originalname.replace(/[^\w.-]/g, '_');
  cb(null, `${Date.now()}-${safeName}`);
}
```

---

### 1.3 Data Integrity dengan Hash SHA-256

#### Data Hash (Hash untuk Data Surat)
- ✅ **Algoritma**: SHA-256 (Secure Hash Algorithm 256-bit)
- ✅ **Input**: Data surat dalam format JSON
  ```javascript
  {
    nomor_surat: "...",
    perihal: "...",
    penandatangan: "...",
    tanggal_surat: "..."
  }
  ```
- ✅ **Output**: 64 karakter hexadecimal string
- ✅ **Fungsi**: Memastikan data tidak diubah setelah disimpan

**Implementasi:**
```javascript
const generateDataHash = (data) => {
  const dataString = JSON.stringify({
    nomor_surat: data.nomor_surat,
    perihal: data.perihal,
    penandatangan: data.penandatangan,
    tanggal_surat: data.tanggal_surat,
  });
  return crypto.createHash('sha256').update(dataString).digest('hex');
};
```

#### Signature Hash (Hash untuk File Tanda Tangan)
- ✅ **Algoritma**: SHA-256
- ✅ **Input**: File buffer dari gambar tanda tangan
- ✅ **Output**: 64 karakter hexadecimal string
- ✅ **Fungsi**: Memastikan file tanda tangan tidak diubah

**Implementasi:**
```javascript
const generateSignatureHash = async (signaturePath) => {
  if (!signaturePath) return null;
  const fileBuffer = fs.readFileSync(signaturePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};
```

#### Verifikasi Integritas Data
- ✅ **Proses**: 
  1. Ambil data dari database
  2. Reconstruct data object
  3. Hitung ulang hash SHA-256
  4. Bandingkan dengan hash tersimpan
  5. Return status: `integrity_verified: true/false`

**Implementasi:**
```javascript
const verifyDataIntegrity = (row) => {
  if (!row.data_hash) return false;
  const currentData = {
    nomor_surat: row.nomor_surat,
    perihal: row.perihal,
    penandatangan: row.penandatangan,
    tanggal_surat: row.tanggal_surat,
  };
  const dataString = JSON.stringify(currentData);
  const computedHash = crypto.createHash('sha256').update(dataString).digest('hex');
  return computedHash === row.data_hash;
};
```

---

### 1.4 URL Security dengan Nonce (UUID)

#### Nonce Generation
- ✅ **Format**: UUID v4 (Universally Unique Identifier)
- ✅ **Library**: `uuid` package
- ✅ **Fungsi**: Mencegah akses tidak sah ke data surat

**Implementasi:**
```javascript
const nonce = uuidv4(); // Contoh: "550e8400-e29b-41d4-a716-446655440000"
```

#### URL Verification
- ✅ **Format URL**: `/verify?id={id}&nonce={nonce}`
- ✅ **Validasi**: 
  - ID harus integer > 0
  - Nonce harus UUID format
  - Query harus match dengan data di database

**Implementasi:**
```javascript
app.get('/api/verify', [
  query('id').isInt({ gt: 0 }).withMessage('ID tidak valid'),
  query('nonce').isUUID().withMessage('Nonce tidak valid'),
], async (req, res) => {
  const { id, nonce } = req.query;
  const row = await db.get('SELECT * FROM letters WHERE id = ? AND nonce = ?', [id, nonce]);
  // ...
});
```

**Keamanan:**
- ✅ Tanpa nonce yang valid, tidak bisa akses data
- ✅ Nonce unik per surat, tidak bisa ditebak
- ✅ QR Code berisi nonce, scan langsung aman

---

### 1.5 Database Security

#### SQL Injection Prevention
- ✅ **Prepared Statements**: Semua query menggunakan parameterized queries
- ✅ **No String Concatenation**: Tidak ada string concatenation di SQL
- ✅ **Input Sanitization**: Semua input di-sanitize sebelum query

**Contoh Aman:**
```javascript
// ✅ AMAN - Parameterized Query
await db.get('SELECT * FROM letters WHERE id = ? AND nonce = ?', [id, nonce]);

// ❌ TIDAK AMAN - String Concatenation (TIDAK DIGUNAKAN)
// await db.get(`SELECT * FROM letters WHERE id = ${id}`); // JANGAN!
```

#### Data Validation di Database
- ✅ **Unique Constraint**: `nomor_surat TEXT NOT NULL UNIQUE COLLATE NOCASE`
- ✅ **NOT NULL Constraints**: Field required tidak boleh NULL
- ✅ **Case-Insensitive**: Nomor surat di-check case-insensitive

**Schema:**
```sql
CREATE TABLE letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_surat TEXT NOT NULL UNIQUE COLLATE NOCASE,
  perihal TEXT NOT NULL,
  penandatangan TEXT NOT NULL,
  tanggal_surat TEXT NOT NULL,
  -- ...
);
```

---

### 1.6 XSS (Cross-Site Scripting) Prevention

#### Server-Side
- ✅ **Sanitization**: Escape HTML characters (`<`, `>`)
- ✅ **Input Validation**: Validasi semua input

#### Client-Side
- ✅ **Escape HTML**: Function untuk escape HTML di frontend
- ✅ **Text Content**: Menggunakan `textContent` bukan `innerHTML` untuk user input

**Implementasi di verify.js:**
```javascript
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
```

---

### 1.7 Security Headers (Opsional)

#### Helmet.js
- ✅ **Library**: `helmet` (^7.1.0)
- ✅ **Status**: Disabled untuk development (HTTP)
- ✅ **Production**: Bisa diaktifkan untuk HTTPS

**Catatan**: Saat ini disabled karena menggunakan HTTP untuk development. Untuk production, aktifkan dengan HTTPS.

---

## 🗄️ BAGIAN 2: DATABASE

### 2.1 Database Technology

#### SQLite3
- ✅ **Type**: File-based database
- ✅ **Library**: `sqlite3` (^5.1.7)
- ✅ **File Location**: `data/signatures.db`
- ✅ **Keuntungan**:
  - Tidak perlu server terpisah
  - Ringan dan cepat
  - Cocok untuk aplikasi sederhana
  - Portable (satu file)

---

### 2.2 Database Schema

#### Table: `letters`

```sql
CREATE TABLE IF NOT EXISTS letters (
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
);
```

#### Field Descriptions

| Field | Type | Constraints | Deskripsi |
|-------|------|-------------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | ID unik surat |
| `nomor_surat` | TEXT | NOT NULL, UNIQUE, COLLATE NOCASE | Nomor surat (case-insensitive) |
| `perihal` | TEXT | NOT NULL | Perihal surat |
| `penandatangan` | TEXT | NOT NULL | Nama penandatangan |
| `tanggal_surat` | TEXT | NOT NULL | Tanggal surat (ISO8601) |
| `file_path` | TEXT | NULL | Path file PDF surat |
| `tanda_tangan_path` | TEXT | NULL | Path file gambar tanda tangan |
| `nonce` | TEXT | NOT NULL | UUID untuk keamanan URL |
| `data_hash` | TEXT | NOT NULL | SHA-256 hash data surat |
| `signature_hash` | TEXT | NULL | SHA-256 hash tanda tangan |
| `created_at` | TEXT | NOT NULL | Timestamp pembuatan (datetime) |

---

### 2.3 Database Operations

#### Connection & Initialization

**File: `db.js`**

```javascript
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(dataDir, 'signatures.db');
const db = new sqlite3.Database(dbPath);

// Auto-create table on startup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS letters (...)`);
  
  // Add columns if they don't exist (migration)
  db.run(`ALTER TABLE letters ADD COLUMN tanda_tangan_path TEXT`, (err) => {
    // Ignore error if column already exists
  });
  // ...
});
```

#### Database Functions

**1. `run(sql, params)` - Execute INSERT/UPDATE/DELETE**
```javascript
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
```

**2. `get(sql, params)` - Get Single Row**
```javascript
const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
```

**3. `all(sql, params)` - Get All Rows**
```javascript
const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
```

---

### 2.4 Database Queries

#### Insert New Letter
```javascript
const result = await db.run(
  `INSERT INTO letters 
    (nomor_surat, perihal, penandatangan, tanggal_surat, file_path, tanda_tangan_path, nonce, data_hash, signature_hash, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  [nomorSurat, perihal, penandatangan, tanggalSurat, filePath, tandaTanganPath, nonce, dataHash, signatureHash]
);
const id = result.lastID;
```

#### Get All Letters
```javascript
const rows = await db.all('SELECT * FROM letters ORDER BY created_at DESC');
```

#### Get Letter by ID and Nonce
```javascript
const row = await db.get('SELECT * FROM letters WHERE id = ? AND nonce = ?', [id, nonce]);
```

#### Check Duplicate Nomor Surat
```javascript
const existing = await db.get(
  'SELECT id, nomor_surat FROM letters WHERE LOWER(TRIM(nomor_surat)) = LOWER(TRIM(?))',
  [nomorSurat]
);
```

#### Update Hash for Old Data
```javascript
await db.run(
  'UPDATE letters SET data_hash = ?, signature_hash = ? WHERE id = ?',
  [dataHash, signatureHash, row.id]
);
```

#### Delete Letter
```javascript
await db.run('DELETE FROM letters WHERE id = ?', [id]);
```

---

### 2.5 Database Features

#### Auto-Migration
- ✅ **Auto-create table**: Table dibuat otomatis saat pertama kali run
- ✅ **Add columns**: Column baru ditambahkan otomatis jika belum ada
- ✅ **Backward compatible**: Data lama tetap bisa digunakan

**Implementasi:**
```javascript
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS letters (...)`);
  
  // Migration: Add columns if they don't exist
  db.run(`ALTER TABLE letters ADD COLUMN tanda_tangan_path TEXT`, (err) => {
    // Ignore error if column already exists
  });
  db.run(`ALTER TABLE letters ADD COLUMN data_hash TEXT`, (err) => {});
  db.run(`ALTER TABLE letters ADD COLUMN signature_hash TEXT`, (err) => {});
});
```

#### Auto-Generate Hash for Old Data
- ✅ **Backward Compatibility**: Data lama tanpa hash otomatis di-generate hash-nya
- ✅ **On-Demand**: Hash di-generate saat data diakses
- ✅ **Update Database**: Hash yang di-generate langsung disimpan

**Implementasi:**
```javascript
// Generate hash for old data that doesn't have hash
if (!row.data_hash) {
  const dataHash = generateDataHash({
    nomor_surat: row.nomor_surat,
    perihal: row.perihal,
    penandatangan: row.penandatangan,
    tanggal_surat: row.tanggal_surat,
  });
  await db.run('UPDATE letters SET data_hash = ? WHERE id = ?', [dataHash, row.id]);
  row.data_hash = dataHash;
}
```

---

### 2.6 Data Storage Structure

#### File Organization
```
project-root/
├── data/
│   └── signatures.db          # Database SQLite
├── uploads/                   # File PDF surat
│   └── {timestamp}-{filename}.pdf
├── signatures/                # File gambar tanda tangan
│   └── signature-{timestamp}.{jpg|png}
└── qrcodes/                   # File QR Code PNG
    └── qr-{id}.png
```

#### Database File
- ✅ **Location**: `data/signatures.db`
- ✅ **Type**: SQLite database file
- ✅ **Size**: Tergantung jumlah data
- ✅ **Backup**: Bisa di-backup dengan copy file

---

## 📊 RINGKASAN UNTUK PPT

### Slide 1: Keamanan Sistem - Overview
- Input Validation (Client & Server)
- File Upload Security
- Data Integrity (SHA-256 Hash)
- URL Security (Nonce/UUID)
- Database Security (SQL Injection Prevention)
- XSS Prevention

### Slide 2: Input Validation
- **Client-Side**: HTML5 + JavaScript
- **Server-Side**: Express-Validator
- **Sanitization**: XSS Prevention
- **Real-time**: Duplikasi check

### Slide 3: File Upload Security
- **Type Validation**: PDF (5MB), Image (2MB)
- **Size Limits**: Enforced di server
- **Filename Sanitization**: Safe naming
- **Storage**: Organized folder structure

### Slide 4: Data Integrity (SHA-256)
- **Data Hash**: Hash dari data surat (JSON)
- **Signature Hash**: Hash dari file tanda tangan
- **Verification**: Recalculate & compare
- **Output**: 64-char hex string

### Slide 5: URL Security (Nonce)
- **Format**: UUID v4
- **URL**: `/verify?id={id}&nonce={nonce}`
- **Validation**: ID (integer) + Nonce (UUID)
- **Security**: Tanpa nonce tidak bisa akses

### Slide 6: Database Security
- **SQL Injection**: Prepared statements
- **Data Validation**: Unique constraints
- **Case-Insensitive**: Nomor surat check
- **Migration**: Auto-add columns

### Slide 7: Database Schema
- **Table**: `letters`
- **Fields**: 11 columns
- **Constraints**: NOT NULL, UNIQUE, PRIMARY KEY
- **Types**: INTEGER, TEXT

### Slide 8: Database Operations
- **CRUD**: Create, Read, Update, Delete
- **Functions**: `run()`, `get()`, `all()`
- **Async/Await**: Promise-based
- **Error Handling**: Try-catch

### Slide 9: Database Features
- **Auto-Migration**: Add columns automatically
- **Backward Compatible**: Old data support
- **Auto-Generate Hash**: For old data
- **File-Based**: SQLite (portable)

### Slide 10: Security Best Practices
- ✅ Input validation multi-layer
- ✅ File type & size validation
- ✅ Hash untuk integritas data
- ✅ Nonce untuk URL security
- ✅ Prepared statements
- ✅ XSS prevention
- ✅ Sanitization

---

## 🔍 POIN-POIN PENTING UNTUK PRESENTASI

### Keamanan
1. **Multi-layer Validation**: Client + Server
2. **Hash SHA-256**: Untuk data integrity
3. **Nonce UUID**: Untuk URL security
4. **SQL Injection Prevention**: Prepared statements
5. **XSS Prevention**: Sanitization + Escape HTML
6. **File Security**: Type & size validation

### Database
1. **SQLite**: File-based, portable
2. **Schema**: 11 fields dengan constraints
3. **Auto-Migration**: Backward compatible
4. **Hash Storage**: Data & signature hash
5. **Operations**: CRUD dengan Promise-based functions
6. **File Organization**: Structured folder system

---

**Dokumen ini siap digunakan sebagai bahan presentasi PPT!** 📊✨
