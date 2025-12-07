# LAPORAN AKHIR
## SISTEM VERIFIKASI TANDA TANGAN DIGITAL UNTUK SURAT SEDERHANA
### Keamanan Sistem Informasi - Kelompok 2

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Requirement](#2-requirement)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Cara Kerja Sistem](#4-cara-kerja-sistem)
5. [UI/UX Design](#5-uiux-design)
6. [Cara Mengoperasikan](#6-cara-mengoperasikan)
7. [Teknologi yang Digunakan](#7-teknologi-yang-digunakan)
8. [Fitur-Fitur Sistem](#8-fitur-fitur-sistem)
9. [Keamanan Sistem](#9-keamanan-sistem)
10. [Kesimpulan](#10-kesimpulan)

---

## 1. PENDAHULUAN

### 1.1 Latar Belakang
Sistem Verifikasi Tanda Tangan Digital adalah aplikasi web yang dirancang untuk mengimplementasikan konsep tanda tangan digital pada surat sederhana dengan menggunakan metode hash (SHA-256) untuk memastikan integritas data dan keaslian dokumen.

### 1.2 Tujuan
- Mengimplementasikan konsep tanda tangan digital untuk kepentingan surat sederhana
- Menerapkan metode hash (SHA-256) untuk enkripsi dan verifikasi integritas data
- Membuat sistem verifikasi untuk pengecekan validitas tanda tangan
- Menyediakan antarmuka yang user-friendly dan mobile-friendly

### 1.3 Ruang Lingkup
Sistem ini mencakup:
- Input data surat dengan upload file PDF (opsional)
- Upload gambar tanda tangan (JPG/PNG)
- Generate QR Code untuk verifikasi
- Sistem verifikasi dengan hash SHA-256
- Dashboard admin untuk manajemen data
- Export data ke Excel

---

## 2. REQUIREMENT

### 2.1 Functional Requirements

#### 2.1.1 Input Surat
- ✅ User dapat menginput data surat (nomor surat, perihal, penandatangan, tanggal)
- ✅ User dapat upload file PDF surat (opsional)
- ✅ User dapat upload gambar tanda tangan JPG/PNG (opsional)
- ✅ Sistem melakukan validasi input
- ✅ Sistem mencegah duplikasi nomor surat

#### 2.1.2 Generate QR Code
- ✅ Sistem otomatis generate QR Code setelah data disimpan
- ✅ QR Code berisi URL verifikasi dengan ID dan nonce unik
- ✅ QR Code dapat di-download

#### 2.1.3 Digital Signature (Hash)
- ✅ Sistem generate hash SHA-256 untuk data surat
- ✅ Sistem generate hash SHA-256 untuk file tanda tangan
- ✅ Hash disimpan di database untuk verifikasi

#### 2.1.4 Verifikasi
- ✅ User dapat verifikasi surat melalui QR Code
- ✅ Sistem memverifikasi integritas data dengan membandingkan hash
- ✅ Sistem menampilkan status verifikasi (Verified/Invalid)
- ✅ Sistem menampilkan informasi hash untuk audit

#### 2.1.5 Dashboard Admin
- ✅ Admin dapat melihat semua data surat
- ✅ Admin dapat download QR Code
- ✅ Admin dapat download file surat
- ✅ Admin dapat melihat tanda tangan
- ✅ Admin dapat hapus data
- ✅ Admin dapat export data ke Excel

### 2.2 Non-Functional Requirements

#### 2.2.1 Performance
- Response time < 2 detik untuk operasi normal
- Support file upload hingga 5MB (PDF) dan 2MB (gambar)

#### 2.2.2 Security
- Input validation dan sanitization
- Hash SHA-256 untuk integritas data
- Nonce (UUID) untuk keamanan URL verifikasi
- File type validation

#### 2.2.3 Usability
- Interface yang user-friendly
- Mobile-responsive design
- Dark theme untuk kenyamanan mata
- Clear error messages

---

## 3. ARSITEKTUR SISTEM

### 3.1 Struktur Folder

```
Keamanan Sistem Informasi part 2/
├── data/
│   └── signatures.db          # Database SQLite
├── public/                     # Frontend files
│   ├── css/
│   │   └── style.css          # Styling dengan dark theme
│   ├── js/
│   │   ├── main.js            # Logic halaman input
│   │   ├── admin.js           # Logic dashboard admin
│   │   └── verify.js          # Logic halaman verifikasi
│   ├── index.html             # Halaman input surat
│   ├── admin.html             # Dashboard admin
│   └── verify.html            # Halaman verifikasi
├── uploads/                    # File PDF surat
├── signatures/                 # File gambar tanda tangan
├── qrcodes/                    # File QR Code PNG
├── server.js                   # Backend server (Express.js)
├── db.js                       # Database configuration
├── schema.sql                  # Database schema
└── package.json                # Dependencies
```

### 3.2 Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ index.html│ │admin.html│ │verify.html│              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │             │                     │
│  ┌────▼─────┐  ┌───▼────┐  ┌────▼─────┐              │
│  │ main.js  │  │admin.js│  │ verify.js │              │
│  └────┬─────┘  └───┬────┘  └────┬─────┘              │
└───────┼─────────────┼────────────┼──────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                    │
        ┌───────────▼───────────┐
        │   EXPRESS SERVER      │
        │    (server.js)        │
        │                       │
        │  ┌─────────────────┐  │
        │  │  API Endpoints  │  │
        │  │  - POST /api/   │  │
        │  │    letters      │  │
        │  │  - GET /api/    │  │
        │  │    letters      │  │
        │  │  - GET /api/    │  │
        │  │    verify       │  │
        │  │  - GET /api/    │  │
        │  │    export/excel │  │
        │  └────────┬────────┘  │
        │           │           │
        │  ┌────────▼────────┐  │
        │  │ Hash Generator     │  │
        │  │ (SHA-256)       │  │
        │  └────────┬────────┘  │
        │           │           │
        │  ┌────────▼────────┐  │
        │  │ QR Generator   │  │
        │  └────────┬────────┘  │
        └───────────┼────────────┘
                    │
        ┌───────────▼───────────┐
        │   SQLite Database    │
        │   (signatures.db)    │
        │                       │
        │  Table: letters       │
        │  - id                 │
        │  - nomor_surat        │
        │  - perihal            │
        │  - penandatangan      │
        │  - tanggal_surat      │
        │  - file_path          │
        │  - tanda_tangan_path  │
        │  - nonce              │
        │  - data_hash          │
        │  - signature_hash     │
        │  - created_at         │
        └───────────────────────┘
```

### 3.3 Database Schema

```sql
CREATE TABLE letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_surat TEXT NOT NULL UNIQUE COLLATE NOCASE,
  perihal TEXT NOT NULL,
  penandatangan TEXT NOT NULL,
  tanggal_surat TEXT NOT NULL,
  file_path TEXT,                    -- Path file PDF surat
  tanda_tangan_path TEXT,            -- Path file gambar tanda tangan
  nonce TEXT NOT NULL,                -- UUID untuk keamanan URL
  data_hash TEXT NOT NULL,            -- SHA-256 hash data surat
  signature_hash TEXT,                -- SHA-256 hash tanda tangan
  created_at TEXT NOT NULL            -- Timestamp pembuatan
);
```

---

## 4. CARA KERJA SISTEM

### 4.1 Flow Input Surat

```
1. User mengakses halaman input (/)
   ↓
2. User mengisi form:
   - Nomor Surat (required)
   - Perihal (required)
   - Nama Penandatangan (required)
   - Tanggal Surat (required)
   - Upload File PDF (optional)
   - Upload Tanda Tangan (optional)
   ↓
3. User klik "Simpan & Generate QR"
   ↓
4. Client-side validation (HTML5)
   ↓
5. POST /api/letters dengan FormData
   ↓
6. Server-side validation (express-validator)
   ↓
7. Cek duplikasi nomor surat
   ↓
8. Generate Hash SHA-256:
   - Data Hash: hash dari (nomor_surat, perihal, penandatangan, tanggal_surat)
   - Signature Hash: hash dari file gambar tanda tangan (jika ada)
   ↓
9. Generate Nonce (UUID v4)
   ↓
10. Simpan ke database:
    - Data surat
    - File paths
    - Hash values
    - Nonce
    ↓
11. Generate QR Code:
    - URL: http://[IP]:3000/verify?id=[id]&nonce=[nonce]
    - Simpan sebagai PNG di folder qrcodes/
    ↓
12. Return response dengan:
    - ID surat
    - Verification URL
    - Hash values
    ↓
13. Client menampilkan:
    - Preview QR Code
    - Hash code
    - Tombol download QR
    - Link verifikasi
```

### 4.2 Flow Verifikasi Surat

```
1. User scan QR Code atau akses URL verifikasi
   ↓
2. Browser membuka /verify?id=[id]&nonce=[nonce]
   ↓
3. verify.html dimuat dengan script verify.js
   ↓
4. JavaScript extract ID dan nonce dari URL
   ↓
5. Fetch GET /api/verify?id=[id]&nonce=[nonce]
   ↓
6. Server validasi ID dan nonce:
   - ID harus integer > 0
   - Nonce harus UUID format
   ↓
7. Query database:
   SELECT * FROM letters WHERE id = ? AND nonce = ?
   ↓
8. Jika tidak ditemukan → Return 404 (INVALID)
   ↓
9. Jika ditemukan → Verifikasi Integritas:
   - Hitung ulang hash dari data surat
   - Bandingkan dengan hash tersimpan
   - Jika sama → integrity_verified = true
   - Jika berbeda → integrity_verified = false
   ↓
10. Return response:
    - status: "VERIFIED"
    - data: {
        nomor_surat,
        perihal,
        penandatangan,
        tanggal_surat,
        download_url,
        tanda_tangan_url,
        data_hash,
        signature_hash,
        integrity_verified,
        created_at
      }
    ↓
11. Client render hasil:
    - Status: VERIFIED / INVALID
    - Data surat
    - Tanda tangan (jika ada)
    - Hash code
    - Status integritas
```

### 4.3 Flow Generate Hash

#### 4.3.1 Data Hash (SHA-256)
```javascript
// Data yang di-hash
const data = {
  nomor_surat: "123/DS/2025",
  perihal: "Perihal surat",
  penandatangan: "Nama Penandatangan",
  tanggal_surat: "2025-12-07"
};

// Convert ke JSON string
const dataString = JSON.stringify(data);

// Generate SHA-256 hash
const hash = crypto.createHash('sha256')
  .update(dataString)
  .digest('hex');

// Contoh hash: "a1b2c3d4e5f6..."
```

#### 4.3.2 Signature Hash (SHA-256)
```javascript
// Baca file gambar tanda tangan
const fileBuffer = fs.readFileSync(signaturePath);

// Generate SHA-256 hash dari file
const hash = crypto.createHash('sha256')
  .update(fileBuffer)
  .digest('hex');

// Contoh hash: "f6e5d4c3b2a1..."
```

### 4.4 Flow Verifikasi Integritas

```
1. Ambil data dari database
   ↓
2. Reconstruct data object:
   {
     nomor_surat: row.nomor_surat,
     perihal: row.perihal,
     penandatangan: row.penandatangan,
     tanggal_surat: row.tanggal_surat
   }
   ↓
3. Convert ke JSON string
   ↓
4. Hitung hash SHA-256
   ↓
5. Bandingkan dengan hash tersimpan (row.data_hash)
   ↓
6. Jika sama → Data tidak diubah (Verified)
   Jika berbeda → Data telah diubah (Invalid)
```

---

## 5. UI/UX DESIGN

### 5.1 Design Philosophy

#### 5.1.1 Dark Theme
- **Background**: Dark blue gradient (#0f172a → #020617)
- **Cards**: Semi-transparent dark (#1e293b) dengan glassmorphism effect
- **Text**: Light colors (#f1f5f9) untuk kontras optimal
- **Accents**: Blue gradient (#3b82f6 → #2563eb) untuk primary actions

#### 5.1.2 Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Sizes**: 
  - Heading 1: 28px (desktop), 22px (mobile)
  - Heading 2: 24px (desktop), 20px (mobile)
  - Body: 15px
  - Small: 12-14px

#### 5.1.3 Color Scheme
```css
Primary: #3b82f6 (Blue)
Success: #10b981 (Green)
Danger: #ef4444 (Red)
Text: #f1f5f9 (Light)
Text Muted: #94a3b8 (Gray)
Border: #334155 (Dark Gray)
```

### 5.2 Halaman Input Surat (index.html)

#### 5.2.1 Layout
```
┌─────────────────────────────────────────┐
│  Header                                 │
│  ┌───┐  🔒 Keamanan Sistem Informasi  │
│  │DS │  Digital Signature Verification │
│  └───┘  Input surat, generate QR...    │
│         [Dashboard Admin]               │
├─────────────────────────────────────────┤
│  Card: Input Data Surat                │
│  ┌─────────────────────────────────┐   │
│  │ Form Grid (2 columns)           │   │
│  │ ┌─────────┐  ┌─────────┐      │   │
│  │ │Nomor    │  │Perihal  │      │   │
│  │ │Surat    │  │         │      │   │
│  │ └─────────┘  └─────────┘      │   │
│  │ ┌─────────┐  ┌─────────┐       │   │
│  │ │Penanda- │  │Tanggal │       │   │
│  │ │tangan   │  │Surat   │       │   │
│  │ └─────────┘  └────────┘       │   │
│  │ ┌─────────┐                   │   │
│  │ │Upload   │                   │   │
│  │ │PDF      │                   │   │
│  │ └─────────┘                   │   │
│  │ ┌─────────┐                   │   │
│  │ │Upload   │                   │   │
│  │ │Tanda    │                   │   │
│  │ │Tangan   │                   │   │
│  │ │[Preview]│                   │   │
│  │ └─────────┘                   │   │
│  │ [Simpan & Generate QR]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Result Box (setelah submit)           │
│  ┌─────────────────────────────────┐   │
│  │ ✓ QR Code berhasil dibuat       │   │
│  │ [QR Code Image]                 │   │
│  │ Hash Code: a1b2c3d4...          │   │
│  │ [Download QR] [Verifikasi]     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### 5.2.2 Fitur UI
- **Form Grid**: Responsive 2-column layout (1 column di mobile)
- **File Upload**: 
  - Dashed border untuk visual feedback
  - Preview gambar tanda tangan sebelum submit
  - File name display setelah pilih file
- **Button States**:
  - Normal: Blue gradient
  - Hover: Lifted dengan shadow
  - Loading: "Menyimpan..." text
  - Disabled: Grayed out
- **Result Box**:
  - Slide-in animation
  - QR Code preview
  - Hash code display
  - Action buttons

### 5.3 Dashboard Admin (admin.html)

#### 5.3.1 Layout
```
┌─────────────────────────────────────────┐
│  Header                                 │
│  ┌───┐  🔒 Keamanan Sistem Informasi  │
│  │DS │  Dashboard Admin                │
│  └───┘  Pantau seluruh surat...         │
│         [Input Surat] [Export Excel]    │
├─────────────────────────────────────────┤
│  Card: Data Surat                       │
│  ┌─────────────────────────────────┐   │
│  │ Table Responsive                 │   │
│  │ ┌──┬──────┬──────┬──────┬───┐   │   │
│  │ │No│Nomor │Perih│Penand│QR │   │   │
│  │ │  │Surat │al   │atangan│&  │   │   │
│  │ │  │      │     │      │Hash│   │   │
│  │ ├──┼──────┼──────┼──────┼───┤   │   │
│  │ │1 │123/  │Test │Wildan│[QR]│   │   │
│  │ │  │DS/25 │     │      │hash│   │   │
│  │ └──┴──────┴──────┴──────┴───┘   │   │
│  │                                  │   │
│  │ Actions:                         │   │
│  │ [Download QR] [Verifikasi]      │   │
│  │ [Download Surat] [Hapus]        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### 5.3.2 Fitur UI
- **Table**:
  - Responsive dengan horizontal scroll di mobile
  - Hover effect pada row
  - QR Code thumbnail dengan hash di bawahnya
- **Actions**:
  - Multiple action buttons per row
  - Color-coded buttons (primary, ghost, danger)
  - Confirmation dialog untuk delete

### 5.4 Halaman Verifikasi (verify.html)

#### 5.4.1 Layout
```
┌─────────────────────────────────────────┐
│  Card: Verifikasi                       │
│  ┌─────────────────────────────────┐   │
│  │ ┌───┐  🔒 Keamanan Sistem...    │   │
│  │ │DS │  Digital Signature...     │   │
│  │ └───┘  Hasil Verifikasi Surat   │   │
│  │         Halaman ini terbuka...  │   │
│  ├─────────────────────────────────┤   │
│  │ [Loading...]                    │   │
│  │ (atau)                          │   │
│  │ ✅ VERIFIED                     │   │
│  │ Surat terverifikasi dan sah     │   │
│  │ ┌──────┬──────┬──────┬──────┐  │   │
│  │ │Nomor │Perih│Penand│Tanggal│  │   │
│  │ │Surat │al   │atangan│      │  │   │
│  │ └──────┴──────┴──────┴──────┘  │   │
│  │ [Download Surat PDF]            │   │
│  │ [Tanda Tangan Image]            │   │
│  │ ✅ Integritas Data Terverifikasi│  │
│  │ Hash: a1b2c3d4...              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### 5.4.2 Fitur UI
- **Status Badge**: 
  - Green (Verified) / Red (Invalid)
  - Icon indicator
- **Info Grid**: 
  - 4-column grid (responsive)
  - Card-based layout
- **Hash Display**:
  - Code block style
  - Full hash untuk audit
  - Status integritas

### 5.5 Responsive Design

#### 5.5.1 Breakpoints
- **Desktop**: > 768px (2-column grid, full table)
- **Tablet**: 481px - 768px (1-column grid, scrollable table)
- **Mobile**: ≤ 480px (1-column, stacked buttons, compact table)

#### 5.5.2 Mobile Optimizations
- Font size 16px untuk input (prevent iOS zoom)
- Full-width buttons
- Touch-friendly button sizes (min 44px)
- Horizontal scroll untuk table
- Stacked layout untuk forms

### 5.6 Visual Elements

#### 5.6.1 Icons & Badges
- **Hero Icon**: Blue gradient square dengan "DS"
- **Security Badge**: "🔒 Keamanan Sistem Informasi - Kelompok 2"
- **Status Badges**: 
  - Success (green): Verified, Success
  - Danger (red): Invalid, Error
- **Pill Badges**: Untuk kategori dan tags

#### 5.6.2 Animations
- **Hover Effects**: 
  - Cards: Lift dengan shadow
  - Buttons: Scale dan shadow
  - QR Code: Scale on hover
- **Loading Animation**: Spinning circle
- **Slide-in Animation**: Result box setelah submit
- **Smooth Transitions**: Semua interaksi menggunakan transition 0.3s

#### 5.6.3 Glassmorphism Effect
- **Header**: Semi-transparent dengan backdrop blur
- **Cards**: Semi-transparent dengan border subtle
- **Background Pattern**: Grid pattern dengan opacity rendah
- **Security Icons**: Watermark di background header

### 5.7 Color Psychology

- **Blue (Primary)**: Trust, security, professionalism
- **Green (Success)**: Verified, valid, safe
- **Red (Danger)**: Invalid, error, warning
- **Dark Background**: Modern, professional, reduce eye strain
- **Light Text**: High contrast untuk readability

---

## 6. CARA MENGOPERASIKAN

### 6.1 Instalasi dan Setup

#### 6.1.1 Prasyarat
- **Node.js**: Versi 14 atau lebih baru
- **npm**: Biasanya sudah termasuk dengan Node.js
- **Git** (opsional): Untuk clone repository

#### 6.1.2 Langkah Instalasi

```bash
# 1. Buka terminal/command prompt di folder project
cd "D:\Keamanan Sistem Informasi part 2"

# 2. Install dependencies
npm install

# 3. Pastikan folder berikut ada (akan dibuat otomatis):
# - data/ (untuk database)
# - uploads/ (untuk file PDF)
# - signatures/ (untuk gambar tanda tangan)
# - qrcodes/ (untuk QR Code)
```

#### 6.1.3 Menjalankan Server

```bash
# Mode Production
npm start

# Mode Development (dengan auto-reload)
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 6.2 Mengoperasikan Sistem

#### 6.2.1 Input Surat Baru

1. **Buka Halaman Input**
   - Akses: `http://localhost:3000`
   - Atau klik "Input Surat" dari dashboard admin

2. **Isi Form Data Surat**
   - **Nomor Surat**: Masukkan nomor surat (contoh: `123/DS/2025`)
     - ⚠️ Harus unik, tidak boleh duplikat
   - **Perihal**: Masukkan perihal surat
   - **Nama Penandatangan**: Masukkan nama lengkap penandatangan
   - **Tanggal Surat**: Pilih tanggal menggunakan date picker

3. **Upload File (Opsional)**
   - **File Surat PDF**: 
     - Klik "Choose File"
     - Pilih file PDF (maksimal 5MB)
     - File akan ter-upload setelah submit
   - **Gambar Tanda Tangan**:
     - Klik "Choose File"
     - Pilih file JPG atau PNG (maksimal 2MB)
     - Preview akan muncul setelah memilih file

4. **Submit Form**
   - Klik tombol "Simpan & Generate QR"
   - Tunggu proses (tombol akan menampilkan "Menyimpan...")
   - Setelah berhasil, akan muncul:
     - ✅ Status success
     - Preview QR Code
     - Hash code (SHA-256)
     - Tombol download QR Code
     - Link verifikasi

5. **Download QR Code**
   - Klik tombol "📥 Download QR Code"
   - File akan terdownload dengan nama: `qr-code-{id}-{hash8chars}.png`

#### 6.2.2 Verifikasi Surat

**Metode 1: Scan QR Code**
1. Buka aplikasi scanner QR Code di smartphone
2. Scan QR Code yang sudah di-generate
3. Browser akan otomatis membuka halaman verifikasi

**Metode 2: Manual URL**
1. Copy URL verifikasi dari halaman input atau admin
2. Paste di browser
3. Halaman verifikasi akan dimuat

**Hasil Verifikasi:**
- ✅ **VERIFIED**: Data valid dan integritas terverifikasi
  - Menampilkan data surat lengkap
  - Menampilkan tanda tangan (jika ada)
  - Menampilkan hash code
  - Status integritas: ✅ Terverifikasi
- ❌ **INVALID**: Data tidak ditemukan atau tidak valid
  - Pesan error
  - Instruksi troubleshooting

#### 6.2.3 Dashboard Admin

1. **Akses Dashboard**
   - URL: `http://localhost:3000/admin`
   - Atau klik "Dashboard Admin" dari halaman input

2. **Fitur Dashboard**
   - **Tabel Data**: Menampilkan semua surat yang sudah diinput
   - **Kolom Tabel**:
     - No: Nomor urut
     - Nomor Surat
     - Perihal
     - Penandatangan
     - Tanggal
     - QR & Hash: Preview QR Code dengan hash code di bawahnya
     - Aksi: Tombol-tombol aksi

3. **Aksi yang Tersedia**
   - **Download QR**: Download QR Code dengan hash di nama file
   - **Buka Verifikasi**: Buka halaman verifikasi di tab baru
   - **Download Surat**: Download file PDF surat (jika ada)
   - **Lihat Tanda Tangan**: Buka gambar tanda tangan di tab baru
   - **Hapus**: Hapus data surat (dengan konfirmasi)

4. **Export ke Excel**
   - Klik tombol "Export ke Excel"
   - File Excel akan terdownload
   - Berisi:
     - Data surat lengkap
     - Data Hash (SHA-256)
     - Signature Hash (SHA-256)
     - QR Code sebagai gambar

#### 6.2.4 Akses dari Perangkat Lain (Mobile/Network)

1. **Cari IP Lokal Komputer**
   - **Windows**: Buka Command Prompt, ketik `ipconfig`
   - Cari "IPv4 Address" (contoh: `192.168.1.10`)

2. **Akses dari Perangkat Lain**
   - Pastikan perangkat terhubung ke Wi-Fi yang sama
   - Buka browser di perangkat lain
   - Akses: `http://192.168.1.10:3000`
   - Ganti IP dengan IP komputer Anda

3. **Scan QR Code dari Mobile**
   - QR Code otomatis menggunakan IP lokal
   - Dapat di-scan langsung dari mobile device

### 6.3 Troubleshooting

#### 6.3.1 Error "Nomor surat sudah terdaftar"
- **Penyebab**: Nomor surat sudah ada di database
- **Solusi**: 
  - Gunakan nomor surat yang berbeda
  - Atau hapus data lama dari dashboard admin
  - Cek di dashboard admin apakah data sudah ada

#### 6.3.2 Hash Menampilkan "N/A"
- **Penyebab**: Data lama yang dibuat sebelum fitur hash ditambahkan
- **Solusi**: 
  - Refresh dashboard admin
  - Sistem akan otomatis generate hash untuk data lama
  - Hash akan muncul setelah refresh

#### 6.3.3 QR Code Tidak Muncul
- **Penyebab**: Folder qrcodes/ tidak ada atau permission error
- **Solusi**: 
  - Pastikan folder qrcodes/ ada
  - Cek permission folder
  - Restart server

#### 6.3.4 File Tidak Ter-upload
- **Penyebab**: File terlalu besar atau format tidak sesuai
- **Solusi**:
  - PDF: Maksimal 5MB
  - Tanda Tangan: Maksimal 2MB, format JPG/PNG
  - Cek ukuran file sebelum upload

---

## 7. TEKNOLOGI YANG DIGUNAKAN

### 7.1 Backend

#### 7.1.1 Node.js
- **Versi**: 14+ (tested dengan v22.14.0)
- **Fungsi**: Runtime environment untuk JavaScript server-side

#### 7.1.2 Express.js
- **Versi**: ^4.19.2
- **Fungsi**: Web framework untuk Node.js
- **Fitur yang digunakan**:
  - Routing
  - Middleware
  - Static file serving
  - Error handling

#### 7.1.3 SQLite3
- **Versi**: ^5.1.7
- **Fungsi**: Database SQLite untuk penyimpanan data
- **Keuntungan**: 
  - File-based, tidak perlu server terpisah
  - Ringan dan cepat
  - Cocok untuk aplikasi sederhana

#### 7.1.4 Multer
- **Versi**: ^1.4.5-lts.1
- **Fungsi**: Middleware untuk handle file upload
- **Fitur**: 
  - Multiple file upload
  - File validation
  - Size limit

#### 7.1.5 QRCode
- **Versi**: ^1.5.4
- **Fungsi**: Generate QR Code dari URL
- **Format**: PNG image

#### 7.1.6 ExcelJS
- **Versi**: ^4.4.0
- **Fungsi**: Generate dan export Excel file
- **Fitur**: 
  - Insert image (QR Code)
  - Formatting
  - Multiple columns

#### 7.1.7 Crypto (Built-in Node.js)
- **Fungsi**: Generate hash SHA-256
- **Algoritma**: SHA-256 (Secure Hash Algorithm 256-bit)

#### 7.1.8 UUID
- **Versi**: ^9.0.1
- **Fungsi**: Generate unique identifier (nonce)
- **Format**: UUID v4

#### 7.1.9 Express-Validator
- **Versi**: ^7.0.1
- **Fungsi**: Input validation dan sanitization
- **Fitur**: 
  - Field validation
  - Type checking
  - Custom validators

### 7.2 Frontend

#### 7.2.1 HTML5
- **Fitur yang digunakan**:
  - Semantic HTML
  - Form validation
  - File input
  - Date input

#### 7.2.2 CSS3
- **Fitur yang digunakan**:
  - CSS Grid
  - Flexbox
  - CSS Variables
  - Media Queries
  - Animations
  - Gradients
  - Backdrop Filter (glassmorphism)

#### 7.2.3 JavaScript (Vanilla)
- **ES6+ Features**:
  - Async/Await
  - Arrow Functions
  - Template Literals
  - Destructuring
  - Fetch API

#### 7.2.4 Google Fonts
- **Font**: Inter
- **Weights**: 300, 400, 500, 600, 700, 800

### 7.3 Security Libraries

#### 7.3.1 Helmet
- **Versi**: ^7.1.0
- **Fungsi**: Security headers
- **Status**: Disabled untuk development (HTTP)

#### 7.3.2 CORS
- **Versi**: ^2.8.5
- **Fungsi**: Cross-Origin Resource Sharing
- **Config**: Allow all origins (development)

---

## 8. FITUR-FITUR SISTEM

### 8.1 Fitur Utama

#### 8.1.1 Input Data Surat
- ✅ Form input dengan validasi
- ✅ Upload file PDF surat (opsional, maks 5MB)
- ✅ Upload gambar tanda tangan (opsional, maks 2MB)
- ✅ Preview gambar tanda tangan sebelum submit
- ✅ Validasi nomor surat unik
- ✅ Real-time form validation

#### 8.1.2 Generate QR Code
- ✅ Otomatis generate QR Code setelah data disimpan
- ✅ QR Code berisi URL verifikasi dengan ID dan nonce
- ✅ QR Code dapat di-download
- ✅ Nama file download include hash code

#### 8.1.3 Digital Signature (Hash)
- ✅ Generate hash SHA-256 untuk data surat
- ✅ Generate hash SHA-256 untuk file tanda tangan
- ✅ Hash disimpan di database
- ✅ Hash ditampilkan di semua tempat yang relevan

#### 8.1.4 Verifikasi Surat
- ✅ Verifikasi via QR Code scan
- ✅ Verifikasi via URL manual
- ✅ Verifikasi integritas data dengan hash
- ✅ Tampilan status verifikasi (Verified/Invalid)
- ✅ Tampilan informasi hash untuk audit
- ✅ Tampilan tanda tangan (jika ada)
- ✅ Download file surat dari halaman verifikasi

#### 8.1.5 Dashboard Admin
- ✅ Tabel data semua surat
- ✅ Preview QR Code dengan hash
- ✅ Download QR Code dengan hash di nama file
- ✅ Download file surat PDF
- ✅ Lihat gambar tanda tangan
- ✅ Hapus data surat
- ✅ Export data ke Excel dengan hash

### 8.2 Fitur Tambahan

#### 8.2.1 UI/UX
- ✅ Dark theme dengan gradient background
- ✅ Glassmorphism effect pada cards
- ✅ Smooth animations dan transitions
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Touch-friendly untuk mobile
- ✅ Loading states
- ✅ Error handling dengan pesan jelas

#### 8.2.2 Security Features
- ✅ Input validation dan sanitization
- ✅ File type validation
- ✅ File size limits
- ✅ Nonce (UUID) untuk keamanan URL
- ✅ Hash SHA-256 untuk integritas data
- ✅ Case-insensitive nomor surat check

#### 8.2.3 Data Management
- ✅ Auto-generate hash untuk data lama
- ✅ Export ke Excel dengan QR Code
- ✅ Download QR Code individual
- ✅ Download file surat
- ✅ Delete data dengan konfirmasi

---

## 9. KEAMANAN SISTEM

### 9.1 Input Validation

#### 9.1.1 Client-Side Validation
- HTML5 form validation (required, type, pattern)
- JavaScript validation sebelum submit
- Real-time feedback

#### 9.1.2 Server-Side Validation
- Express-validator untuk semua input
- Type checking (string, integer, UUID, date)
- Custom validators
- Sanitization untuk mencegah XSS

### 9.2 File Upload Security

#### 9.2.1 File Type Validation
- PDF: Hanya `application/pdf` untuk surat
- Image: Hanya `image/jpeg`, `image/jpg`, `image/png` untuk tanda tangan
- Reject file dengan tipe tidak sesuai

#### 9.2.2 File Size Limits
- PDF: Maksimal 5MB
- Tanda Tangan: Maksimal 2MB
- Reject file yang melebihi limit

#### 9.2.3 File Naming
- Sanitize filename (remove special characters)
- Timestamp prefix untuk uniqueness
- Safe file storage

### 9.3 Data Integrity

#### 9.3.1 Hash SHA-256
- **Data Hash**: Hash dari data surat (nomor, perihal, penandatangan, tanggal)
- **Signature Hash**: Hash dari file gambar tanda tangan
- **Verifikasi**: Bandingkan hash tersimpan dengan hash yang dihitung ulang

#### 9.3.2 Nonce (UUID)
- Setiap surat memiliki nonce unik (UUID v4)
- Nonce digunakan di URL verifikasi
- Mencegah akses tanpa nonce yang valid

### 9.4 Database Security

#### 9.4.1 SQL Injection Prevention
- Parameterized queries (prepared statements)
- Tidak ada string concatenation di SQL
- Input sanitization

#### 9.4.2 Data Validation
- Unique constraint pada nomor surat
- NOT NULL constraints pada field required
- Case-insensitive comparison

### 9.5 URL Security

#### 9.5.1 Verifikasi URL
- Format: `/verify?id={integer}&nonce={uuid}`
- Validasi ID (harus integer > 0)
- Validasi nonce (harus UUID format)
- Query harus match dengan data di database

---

## 10. KESIMPULAN

### 10.1 Pencapaian

Sistem Verifikasi Tanda Tangan Digital telah berhasil mengimplementasikan:

1. ✅ **Tanda Tangan Digital**: 
   - Upload dan penyimpanan gambar tanda tangan
   - Integrasi dengan data surat

2. ✅ **Metode Hash (SHA-256)**:
   - Hash untuk data surat
   - Hash untuk file tanda tangan
   - Verifikasi integritas data

3. ✅ **Sistem Verifikasi**:
   - Verifikasi via QR Code
   - Verifikasi integritas dengan hash
   - Tampilan status verifikasi

4. ✅ **User Interface**:
   - Dark theme yang aesthetic
   - Mobile-friendly design
   - User-friendly dengan feedback yang jelas

### 10.2 Kelebihan Sistem

1. **Keamanan**:
   - Hash SHA-256 untuk integritas data
   - Nonce untuk keamanan URL
   - Input validation multi-layer

2. **Kemudahan Penggunaan**:
   - Interface yang intuitif
   - QR Code untuk verifikasi mudah
   - Mobile-friendly

3. **Fleksibilitas**:
   - File upload opsional
   - Export ke Excel
   - Download berbagai format

4. **Keterlacakan**:
   - Hash code untuk audit
   - Timestamp untuk tracking
   - Log semua operasi

### 10.3 Keterbatasan

1. **Database**: SQLite cocok untuk penggunaan kecil-menengah, untuk production besar mungkin perlu database server
2. **Storage**: File disimpan lokal, untuk production mungkin perlu cloud storage
3. **Authentication**: Belum ada sistem login/user management
4. **HTTPS**: Saat ini menggunakan HTTP, untuk production perlu HTTPS

### 10.4 Rekomendasi Pengembangan

1. **Authentication & Authorization**: Tambahkan sistem login dan role-based access
2. **Cloud Storage**: Integrasi dengan cloud storage untuk file
3. **HTTPS**: Setup SSL certificate untuk production
4. **Backup**: Sistem backup otomatis untuk database dan file
5. **Logging**: Sistem logging yang lebih comprehensive
6. **API Documentation**: Dokumentasi API dengan Swagger/OpenAPI

---

## LAMPIRAN

### A. Dependencies List

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "exceljs": "^4.4.0",
    "express": "^4.19.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "multer": "^1.4.5-lts.1",
    "qrcode": "^1.5.4",
    "sqlite3": "^5.1.7",
    "uuid": "^9.0.1"
  }
}
```

### B. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Halaman input surat |
| GET | `/admin` | Dashboard admin |
| GET | `/verify` | Halaman verifikasi |
| POST | `/api/letters` | Simpan surat baru |
| GET | `/api/letters` | Daftar semua surat |
| GET | `/api/verify` | Data verifikasi |
| GET | `/api/export/excel` | Export ke Excel |
| GET | `/download/:id` | Download file surat |
| DELETE | `/api/letters/:id` | Hapus surat |

### C. Database Schema

Lihat bagian 3.3 untuk detail lengkap schema database.

---

**Dokumen ini dibuat untuk keperluan laporan akhir mata kuliah Keamanan Sistem Informasi - Kelompok 2**

