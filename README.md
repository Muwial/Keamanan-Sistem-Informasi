# Digital Signature Verification (Node.js + SQLite)

Aplikasi web untuk input surat, generate QR Code, dan verifikasi digital yang bisa diakses dari perangkat di jaringan Wi-Fi yang sama.

## 📚 Dokumentasi

- **[TUTORIAL_SETUP.md](./TUTORIAL_SETUP.md)** - Tutorial lengkap setup dari clone hingga running
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Daftar lengkap requirements sistem
- **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** - Quick start guide
- **[CARA_MENGGUNAKAN.md](./CARA_MENGGUNAKAN.md)** - User manual aplikasi
- **[LAPORAN_AKHIR.md](./LAPORAN_AKHIR.md)** - Laporan akhir project

## 🚀 Quick Start

### Prasyarat
- Node.js 14+ dan npm terinstall
- Git terinstall

### Setup
```bash
# 1. Clone repository
git clone https://github.com/Muwial/Keamanan-Sistem-Informasi.git
cd Keamanan-Sistem-Informasi

# 2. Install dependencies
npm install

# 3. Jalankan server
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

**📖 Untuk tutorial lengkap, lihat [TUTORIAL_SETUP.md](./TUTORIAL_SETUP.md)**

## Fitur
- Input surat dengan validasi & upload PDF (opsional).
- Upload gambar tanda tangan (JPG/PNG).
- QR Code berisi tautan verifikasi dengan nonce unik.
- Hash SHA-256 untuk data integrity dan signature verification.
- Halaman verifikasi (VERIFIED) yang ramah mobile.
- Dashboard admin: tabel data, preview & download QR, download surat, export Excel (QR sebagai gambar).
- Larangan duplikasi nomor surat (UNIQUE).

## Struktur
- `server.js` – server Express & routing.
- `db.js` / `schema.sql` – inisialisasi database SQLite.
- `public/` – halaman `index.html`, `admin.html`, `verify.html`, CSS, JS.
- `uploads/` – file PDF tersimpan.
- `signatures/` – gambar tanda tangan tersimpan.
- `qrcodes/` – file PNG QR Code.
- `data/signatures.db` – file SQLite.

## Akses dari HP (satu Wi-Fi)
- Lihat IP lokal: di Windows `ipconfig` (alamat IPv4). Misal `192.168.1.10`.
- Buka di HP: `http://192.168.1.10:3000`.
- QR Code otomatis menggunakan IP lokal tersebut jika akses dari PC dengan host `localhost`.

## Endpoint penting
- `GET /` – form input surat.
- `GET /admin` – dashboard admin.
- `GET /verify?id={id}&nonce={nonce}` – halaman verifikasi.
- `POST /api/letters` – simpan surat + generate QR.
- `GET /api/letters` – daftar surat.
- `GET /api/verify` – data verifikasi (digunakan oleh `verify.html`).
- `GET /api/export/excel` – export Excel dengan QR image.
- `GET /download/:id` – unduh file surat.

## Skema Database (SQLite)
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

## Catatan Keamanan
- Validasi & sanitasi input dengan `express-validator`.
- Nonce unik per surat di tautan verifikasi (QR tidak dapat dipalsukan).
- Hash SHA-256 untuk data integrity verification.
- Hash SHA-256 untuk signature image verification.
- Pembatasan jenis file: PDF (maks 5MB), JPG/PNG untuk tanda tangan (maks 2MB).
- CORS untuk cross-origin resource sharing.

## Teknologi yang Digunakan
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Security**: SHA-256 hashing, express-validator
- **File Upload**: Multer
- **QR Code**: qrcode library
- **Export**: ExcelJS







