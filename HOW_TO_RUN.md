# Cara Menjalankan Aplikasi

## Prasyarat
- **Node.js** harus sudah terpasang (versi 14 atau lebih baru)
- **npm** biasanya sudah termasuk dengan Node.js

## Langkah-langkah

### 1. Install Dependencies (jika belum)
Jalankan perintah berikut di terminal/command prompt:
```bash
npm install
```
Ini akan menginstall semua package yang diperlukan (express, sqlite3, qrcode, dll).

### 2. Jalankan Server

#### Mode Production:
```bash
npm start
```
atau
```bash
node server.js
```

#### Mode Development (dengan auto-restart):
```bash
npm run dev
```
*Catatan: Perlu install `nodemon` secara global jika belum: `npm install -g nodemon`*

### 3. Akses Aplikasi

Setelah server berjalan, buka browser dan akses:
- **Home/Input Surat**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Verifikasi**: `http://localhost:3000/verify?id=1&nonce=xxx`

### 4. Akses dari Perangkat Lain (HP/Laptop di Wi-Fi yang sama)

1. Cari IP lokal komputer Anda:
   - **Windows**: Buka Command Prompt, ketik `ipconfig`, cari "IPv4 Address"
   - **Contoh**: `192.168.1.10`

2. Akses dari HP/laptop lain menggunakan:
   ```
   http://192.168.1.10:3000
   ```

## Struktur Folder Penting

- `data/` - Database SQLite (`signatures.db`)
- `uploads/` - File PDF yang diupload
- `qrcodes/` - File QR Code yang di-generate
- `public/` - File HTML, CSS, JavaScript untuk frontend

## Troubleshooting

### Port sudah digunakan (Error: EADDRINUSE)
Ubah port di `server.js` atau set environment variable:
```bash
set PORT=3001
npm start
```

### Dependencies tidak terinstall
Hapus `node_modules` dan install ulang:
```bash
rmdir /s node_modules
npm install
```

### Database error
Database akan dibuat otomatis di `data/signatures.db` saat pertama kali dijalankan.

## Environment Variables (Opsional)

Anda bisa set `BASE_URL` jika ingin menggunakan URL custom:
```bash
set BASE_URL=http://yourdomain.com
npm start
```

## Stop Server

Tekan `Ctrl + C` di terminal untuk menghentikan server.

