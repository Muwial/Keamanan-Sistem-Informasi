# DIAGRAM ALIR SISTEM
## Verifikasi Tanda Tangan Digital

---

## 1. DIAGRAM ALIR INPUT SURAT

```
START
  │
  ▼
User Akses Halaman Input (/)
  │
  ▼
Tampilkan Form Input
  │
  ├─► User Isi Form:
  │     - Nomor Surat
  │     - Perihal
  │     - Penandatangan
  │     - Tanggal Surat
  │     - Upload PDF (opsional)
  │     - Upload Tanda Tangan (opsional)
  │
  ▼
User Klik "Simpan & Generate QR"
  │
  ▼
Client-Side Validation
  │
  ├─► Jika Invalid
  │     └─► Tampilkan Error
  │
  ├─► Jika Valid
  │     │
  │     ▼
  │   POST /api/letters
  │     │
  │     ▼
  │   Server-Side Validation
  │     │
  │     ├─► Jika Invalid
  │     │     └─► Return 400 Error
  │     │
  │     ├─► Jika Valid
  │     │     │
  │     │     ▼
  │     │   Cek Duplikasi Nomor Surat
  │     │     │
  │     │     ├─► Jika Duplikat
  │     │     │     └─► Return 409 Error
  │     │     │
  │     │     ├─► Jika Unik
  │     │     │     │
  │     │     │     ▼
  │     │     │   Generate Hash SHA-256:
  │     │     │     - Data Hash (dari data surat)
  │     │     │     - Signature Hash (dari file tanda tangan)
  │     │     │     │
  │     │     │     ▼
  │     │     │   Generate Nonce (UUID v4)
  │     │     │     │
  │     │     │     ▼
  │     │     │   Simpan File (jika ada):
  │     │     │     - PDF → uploads/
  │     │     │     - Tanda Tangan → signatures/
  │     │     │     │
  │     │     │     ▼
  │     │     │   Insert ke Database:
  │     │     │     - Data surat
  │     │     │     - File paths
  │     │     │     - Hash values
  │     │     │     - Nonce
  │     │     │     │
  │     │     │     ▼
  │     │     │   Generate QR Code:
  │     │     │     - URL: /verify?id={id}&nonce={nonce}
  │     │     │     - Simpan sebagai PNG
  │     │     │     │
  │     │     │     ▼
  │     │     │   Return Response:
  │     │     │     - ID
  │     │     │     - Verification URL
  │     │     │     - Hash values
  │     │     │     │
  │     │     │     ▼
  │     │     │   Client Render:
  │     │     │     - Preview QR Code
  │     │     │     - Hash Code
  │     │     │     - Download Button
  │     │     │     - Verification Link
  │     │     │
  │     │     └─► END (Success)
  │     │
  │     └─► END (Error)
  │
  └─► END
```

---

## 2. DIAGRAM ALIR VERIFIKASI SURAT

```
START
  │
  ▼
User Scan QR Code atau Akses URL
  │
  ▼
Browser Buka /verify?id={id}&nonce={nonce}
  │
  ▼
verify.html Dimuat
  │
  ▼
verify.js Extract ID dan Nonce dari URL
  │
  ▼
Fetch GET /api/verify?id={id}&nonce={nonce}
  │
  ▼
Server Validasi Parameter:
  - ID harus integer > 0
  - Nonce harus UUID format
  │
  ├─► Jika Invalid
  │     └─► Return 400 Error
  │
  ├─► Jika Valid
  │     │
  │     ▼
  │   Query Database:
  │     SELECT * FROM letters 
  │     WHERE id = ? AND nonce = ?
  │     │
  │     ├─► Jika Tidak Ditemukan
  │     │     └─► Return 404 (INVALID)
  │     │
  │     ├─► Jika Ditemukan
  │     │     │
  │     │     ▼
  │     │   Verifikasi Integritas:
  │     │     │
  │     │     ▼
  │     │   Reconstruct Data Object:
  │     │     {
  │     │       nomor_surat,
  │     │       perihal,
  │     │       penandatangan,
  │     │       tanggal_surat
  │     │     }
  │     │     │
  │     │     ▼
  │     │   Convert ke JSON String
  │     │     │
  │     │     ▼
  │     │   Hitung Hash SHA-256
  │     │     │
  │     │     ▼
  │     │   Bandingkan dengan Hash Tersimpan
  │     │     │
  │     │     ├─► Jika Sama
  │     │     │     └─► integrity_verified = true
  │     │     │
  │     │     ├─► Jika Berbeda
  │     │     │     └─► integrity_verified = false
  │     │     │
  │     │     ▼
  │     │   Return Response:
  │     │     {
  │     │       status: "VERIFIED",
  │     │       data: {
  │     │         nomor_surat,
  │     │         perihal,
  │     │         penandatangan,
  │     │         tanggal_surat,
  │     │         download_url,
  │     │         tanda_tangan_url,
  │     │         data_hash,
  │     │         signature_hash,
  │     │         integrity_verified,
  │     │         created_at
  │     │       }
  │     │     }
  │     │     │
  │     │     ▼
  │     │   Client Render Hasil:
  │     │     │
  │     │     ├─► Jika integrity_verified = true
  │     │     │     └─► Tampilkan: ✅ VERIFIED
  │     │     │         - Data surat
  │     │     │         - Tanda tangan
  │     │     │         - Hash code
  │     │     │         - Status integritas
  │     │     │
  │     │     ├─► Jika integrity_verified = false
  │     │     │     └─► Tampilkan: ❌ INVALID
  │     │     │         - Pesan error
  │     │     │         - Instruksi
  │     │     │
  │     │     └─► END
  │     │
  │     └─► END
  │
  └─► END
```

---

## 3. DIAGRAM ALIR GENERATE HASH

### 3.1 Generate Data Hash

```
START
  │
  ▼
Ambil Data Surat:
  - nomor_surat
  - perihal
  - penandatangan
  - tanggal_surat
  │
  ▼
Buat Data Object:
  {
    nomor_surat: "...",
    perihal: "...",
    penandatangan: "...",
    tanggal_surat: "..."
  }
  │
  ▼
Convert ke JSON String
  │
  ▼
Hash dengan SHA-256:
  crypto.createHash('sha256')
    .update(dataString)
    .digest('hex')
  │
  ▼
Hasil: 64 karakter hex
  Contoh: "a1b2c3d4e5f6..."
  │
  ▼
Simpan ke Database (data_hash)
  │
  ▼
END
```

### 3.2 Generate Signature Hash

```
START
  │
  ▼
Cek Apakah Ada File Tanda Tangan
  │
  ├─► Jika Tidak Ada
  │     └─► Return null
  │
  ├─► Jika Ada
  │     │
  │     ▼
  │   Baca File dari signatures/
  │     │
  │     ▼
  │   Convert ke Buffer
  │     │
  │     ▼
  │   Hash dengan SHA-256:
  │     crypto.createHash('sha256')
  │       .update(fileBuffer)
  │       .digest('hex')
  │     │
  │     ▼
  │   Hasil: 64 karakter hex
  │     │
  │     ▼
  │   Simpan ke Database (signature_hash)
  │
  ▼
END
```

---

## 4. DIAGRAM ALIR VERIFIKASI INTEGRITAS

```
START
  │
  ▼
Ambil Data dari Database
  │
  ▼
Reconstruct Data Object:
  {
    nomor_surat: row.nomor_surat,
    perihal: row.perihal,
    penandatangan: row.penandatangan,
    tanggal_surat: row.tanggal_surat
  }
  │
  ▼
Convert ke JSON String
  │
  ▼
Hitung Hash SHA-256
  │
  ▼
Bandingkan dengan Hash Tersimpan
  │
  ├─► Jika Hash Sama
  │     │
  │     ▼
  │   Data Tidak Diubah
  │     │
  │     ▼
  │   integrity_verified = true
  │     │
  │     ▼
  │   Return: ✅ VERIFIED
  │
  ├─► Jika Hash Berbeda
  │     │
  │     ▼
  │   Data Telah Diubah
  │     │
  │     ▼
  │   integrity_verified = false
  │     │
  │     ▼
  │   Return: ❌ INVALID
  │
  ▼
END
```

---

## 5. DIAGRAM ALIR DASHBOARD ADMIN

```
START
  │
  ▼
User Akses /admin
  │
  ▼
admin.html Dimuat
  │
  ▼
admin.js Fetch GET /api/letters
  │
  ▼
Server Query Database:
  SELECT * FROM letters 
  ORDER BY created_at DESC
  │
  ▼
Untuk Setiap Row:
  │
  ├─► Cek Apakah Ada Hash
  │     │
  │     ├─► Jika Tidak Ada Hash
  │     │     │
  │     │     ▼
  │     │   Generate Hash:
  │     │     - Data Hash
  │     │     - Signature Hash (jika ada)
  │     │     │
  │     │     ▼
  │     │   Update Database
  │     │
  │     ├─► Jika Ada Hash
  │     │     └─► Gunakan Hash Tersimpan
  │     │
  │     ▼
  │   Generate QR Code (jika belum ada)
  │     │
  │     ▼
  │   Build Response Object:
  │     - Data surat
  │     - QR image URL
  │     - Download URLs
  │     - Hash values
  │     - Verification URL
  │
  ▼
Return Array of Data
  │
  ▼
Client Render Table:
  - Loop setiap data
  - Render row dengan:
    * Nomor urut
    * Data surat
    * QR Code thumbnail
    * Hash code (12 chars)
    * Action buttons
  │
  ▼
User Interaksi:
  │
  ├─► Download QR
  │     └─► Download file dengan hash di nama
  │
  ├─► Buka Verifikasi
  │     └─► Buka /verify di tab baru
  │
  ├─► Download Surat
  │     └─► Download PDF file
  │
  ├─► Lihat Tanda Tangan
  │     └─► Buka gambar di tab baru
  │
  ├─► Hapus
  │     └─► Konfirmasi → DELETE /api/letters/:id
  │
  └─► Export Excel
        └─► GET /api/export/excel
              └─► Generate Excel dengan hash
                    └─► Download file
  │
  ▼
END
```

---

## 6. DIAGRAM ALIR EXPORT EXCEL

```
START
  │
  ▼
User Klik "Export ke Excel"
  │
  ▼
GET /api/export/excel
  │
  ▼
Query Database:
  SELECT * FROM letters 
  ORDER BY created_at DESC
  │
  ▼
Create Excel Workbook
  │
  ▼
Setup Columns:
  - No
  - Nomor Surat
  - Perihal
  - Penandatangan
  - Tanggal Surat
  - Data Hash (SHA-256)
  - Signature Hash (SHA-256)
  - QR Code
  │
  ▼
Untuk Setiap Row:
  │
  ├─► Generate Hash (jika belum ada)
  │     └─► Update database
  │
  ├─► Generate QR Code (jika belum ada)
  │
  ├─► Add Row ke Excel:
  │     - Data surat
  │     - Hash values
  │
  └─► Add QR Code Image ke Excel
  │
  ▼
Set Response Headers:
  - Content-Type: Excel
  - Content-Disposition: attachment
  │
  ▼
Write Excel ke Response
  │
  ▼
Browser Download File Excel
  │
  ▼
END
```

---

## 7. DIAGRAM ALIR SECURITY FLOW

```
┌─────────────────────────────────────────┐
│         INPUT VALIDATION                │
├─────────────────────────────────────────┤
│ 1. Client-Side (HTML5)                   │
│    - Required fields                     │
│    - Type validation                     │
│    - Pattern matching                    │
│                                          │
│ 2. Server-Side (express-validator)     │
│    - Type checking                       │
│    - Format validation                   │
│    - Custom validators                   │
│    - Sanitization                        │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         FILE VALIDATION                 │
├─────────────────────────────────────────┤
│ 1. Type Check:                          │
│    - PDF: application/pdf                │
│    - Image: image/jpeg, image/png       │
│                                          │
│ 2. Size Check:                          │
│    - PDF: ≤ 5MB                         │
│    - Image: ≤ 2MB                       │
│                                          │
│ 3. Filename Sanitization:               │
│    - Remove special chars                │
│    - Add timestamp prefix                │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         HASH GENERATION                 │
├─────────────────────────────────────────┤
│ 1. Data Hash (SHA-256):                 │
│    - Input: Data surat (JSON)           │
│    - Output: 64-char hex string         │
│                                          │
│ 2. Signature Hash (SHA-256):            │
│    - Input: File buffer                 │
│    - Output: 64-char hex string         │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         DATABASE STORAGE                │
├─────────────────────────────────────────┤
│ - Prepared Statements (SQL Injection)  │
│ - Parameterized Queries                 │
│ - Input Sanitization                    │
│ - Unique Constraints                    │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         VERIFICATION                    │
├─────────────────────────────────────────┤
│ 1. URL Validation:                      │
│    - ID: Integer > 0                    │
│    - Nonce: UUID format                 │
│                                          │
│ 2. Database Query:                      │
│    - WHERE id = ? AND nonce = ?         │
│                                          │
│ 3. Integrity Check:                     │
│    - Recalculate hash                    │
│    - Compare with stored hash            │
│    - Return verification status          │
└─────────────────────────────────────────┘
```

---

**Diagram ini menjelaskan alur kerja sistem secara detail untuk keperluan dokumentasi dan presentasi**

