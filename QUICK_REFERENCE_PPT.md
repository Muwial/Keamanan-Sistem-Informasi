# ⚡ QUICK REFERENCE - Bahan PPT
## Sistem Verifikasi Tanda Tangan Digital

---

## 🔒 KEAMANAN SISTEM (5 Slide)

### Slide 1: Overview Keamanan
```
✅ Input Validation (Client + Server)
✅ File Upload Security
✅ Data Integrity (SHA-256)
✅ URL Security (Nonce/UUID)
✅ Database Security
✅ XSS Prevention
```

### Slide 2: Input Validation
```
CLIENT-SIDE:
• HTML5 form validation
• JavaScript real-time check
• Duplikasi nomor surat check

SERVER-SIDE:
• Express-validator
• Type checking (string, int, UUID, date)
• Sanitization (XSS prevention)
```

### Slide 3: File Upload Security
```
VALIDASI TIPE:
• PDF: application/pdf (max 5MB)
• Image: jpeg/jpg/png (max 2MB)

KEAMANAN:
• Filename sanitization
• Timestamp prefix
• Safe storage
```

### Slide 4: Data Integrity (SHA-256)
```
DATA HASH:
• Input: Data surat (JSON)
• Algoritma: SHA-256
• Output: 64-char hex string
• Fungsi: Verifikasi integritas

SIGNATURE HASH:
• Input: File buffer tanda tangan
• Algoritma: SHA-256
• Output: 64-char hex string
• Fungsi: Verifikasi file tidak diubah
```

### Slide 5: URL Security & Database
```
URL SECURITY:
• Format: /verify?id={id}&nonce={nonce}
• Nonce: UUID v4 (unpredictable)
• Validasi: ID (int) + Nonce (UUID)

DATABASE SECURITY:
• Prepared statements (SQL injection prevention)
• Parameterized queries
• Unique constraints
• Case-insensitive check
```

---

## 🗄️ DATABASE (5 Slide)

### Slide 6: Database Technology
```
TEKNOLOGI:
• SQLite3 (file-based)
• Location: data/signatures.db
• Portable (satu file)
• Tidak perlu server terpisah
```

### Slide 7: Database Schema
```
TABLE: letters
┌─────────────────┬──────────┬─────────────┐
│ Field           │ Type     │ Constraints │
├─────────────────┼──────────┼─────────────┤
│ id              │ INTEGER  │ PRIMARY KEY │
│ nomor_surat     │ TEXT     │ UNIQUE      │
│ perihal         │ TEXT     │ NOT NULL    │
│ penandatangan   │ TEXT     │ NOT NULL    │
│ tanggal_surat   │ TEXT     │ NOT NULL    │
│ file_path       │ TEXT     │ NULL        │
│ tanda_tangan_   │ TEXT     │ NULL        │
│   path          │          │             │
│ nonce           │ TEXT     │ NOT NULL    │
│ data_hash       │ TEXT     │ NOT NULL    │
│ signature_hash  │ TEXT     │ NULL        │
│ created_at      │ TEXT     │ NOT NULL    │
└─────────────────┴──────────┴─────────────┘
```

### Slide 8: Database Operations
```
FUNCTIONS:
• run(sql, params)   → INSERT/UPDATE/DELETE
• get(sql, params)    → Get single row
• all(sql, params)    → Get all rows

CONTOH QUERY:
• INSERT: Simpan surat baru
• SELECT: Ambil semua surat
• SELECT: Cek duplikasi
• UPDATE: Update hash
• DELETE: Hapus surat
```

### Slide 9: Database Features
```
AUTO-MIGRATION:
• Auto-create table
• Auto-add columns
• Backward compatible

AUTO-GENERATE HASH:
• Generate hash untuk data lama
• Update database otomatis
• On-demand generation
```

### Slide 10: File Organization
```
STRUKTUR FOLDER:
data/
  └── signatures.db    (Database)

uploads/
  └── {timestamp}-{file}.pdf

signatures/
  └── signature-{timestamp}.{jpg|png}

qrcodes/
  └── qr-{id}.png
```

---

## 📊 DIAGRAM ALIR SINGKAT

### Flow Input Surat
```
User Input → Client Validation → Server Validation 
→ Cek Duplikasi → Generate Hash → Generate Nonce 
→ Simpan DB → Generate QR → Return Response
```

### Flow Verifikasi
```
Scan QR/URL → Extract ID & Nonce → Validasi Parameter 
→ Query DB → Verifikasi Integritas (Hash) 
→ Return Status (VERIFIED/INVALID)
```

### Flow Hash Generation
```
Data Surat → JSON String → SHA-256 → 64-char Hash
File Tanda Tangan → File Buffer → SHA-256 → 64-char Hash
```

---

## 🎯 POIN UTAMA PRESENTASI

### KEAMANAN
1. ✅ **Multi-layer Validation**: Client + Server
2. ✅ **SHA-256 Hash**: Data integrity verification
3. ✅ **UUID Nonce**: URL security
4. ✅ **Prepared Statements**: SQL injection prevention
5. ✅ **File Validation**: Type & size limits
6. ✅ **XSS Prevention**: Sanitization

### DATABASE
1. ✅ **SQLite**: File-based, portable
2. ✅ **11 Fields**: Complete data structure
3. ✅ **Auto-Migration**: Backward compatible
4. ✅ **Hash Storage**: Data & signature hash
5. ✅ **CRUD Operations**: Promise-based functions

---

## 💡 CONTOH KODE PENTING

### Generate Hash
```javascript
const hash = crypto.createHash('sha256')
  .update(JSON.stringify(data))
  .digest('hex');
```

### Prepared Statement
```javascript
await db.get(
  'SELECT * FROM letters WHERE id = ? AND nonce = ?',
  [id, nonce]
);
```

### File Validation
```javascript
if (file.mimetype !== 'application/pdf') {
  return cb(new Error('Hanya PDF yang diperbolehkan'));
}
```

---

**Gunakan ini sebagai quick reference saat presentasi!** 🎤📊
