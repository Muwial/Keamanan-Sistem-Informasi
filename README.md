# Digital Signature Verification (Node.js + SQLite)

Aplikasi web untuk input surat, generate QR Code, dan verifikasi digital yang bisa diakses dari perangkat di jaringan Wi-Fi yang sama.

## Fitur
- Input surat dengan validasi & upload PDF (opsional).
- QR Code berisi tautan verifikasi dengan nonce unik.
- Halaman verifikasi (VERIFIED) yang ramah mobile.
- Dashboard admin: tabel data, preview & download QR, download surat, export Excel (QR sebagai gambar).
- Larangan duplikasi nomor surat (UNIQUE).

## Struktur
- `server.js` – server Express & routing.
- `db.js` / `schema.sql` – inisialisasi database SQLite.
- `public/` – halaman `index.html`, `admin.html`, `verify.html`, CSS, JS.
- `uploads/` – file PDF tersimpan.
- `qrcodes/` – file PNG QR Code.
- `data/signatures.db` – file SQLite.

## Menjalankan
1) Pastikan Node.js terpasang.  
2) Install dependency:
   ```bash
   npm install
   ```
3) Jalankan server:
   ```bash
   npm start
   ```
   Server default di `http://localhost:3000`.

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
  nonce TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

## Catatan Keamanan
- Validasi & sanitasi input dengan `express-validator`.
- Nonce unik per surat di tautan verifikasi (QR tidak dapat dipalsukan).
- Pembatasan jenis file: hanya PDF, maksimal 5MB.
- Helmet & CORS untuk header keamanan dasar.

## Push ke GitHub (Automated)

### Opsi 1: Script Batch (Windows) - Paling Mudah
Double-click file berikut untuk push otomatis:
- **`push-to-github.bat`** - Push dengan input pesan commit (interaktif)
- **`quick-push.bat`** - Push cepat dengan pesan default (tanpa input)

### Opsi 2: NPM Script
```bash
# Push dengan pesan custom
npm run push "Pesan commit Anda"

# Push cepat dengan pesan default
npm run quick-push
```

### Opsi 3: PowerShell Script
```powershell
.\push-to-github.ps1
```

### Opsi 4: GitHub Actions (Web Interface)
1. Buka repository di GitHub
2. Klik tab **Actions**
3. Pilih workflow **"Auto Push on Manual Trigger"**
4. Klik **"Run workflow"**
5. Masukkan pesan commit (opsional)
6. Klik **"Run workflow"**

**Catatan:** Pastikan sudah login ke GitHub (untuk script lokal) atau sudah setup GitHub CLI.







