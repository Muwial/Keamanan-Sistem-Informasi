# Troubleshooting - Halaman Verifikasi

## Masalah: Halaman Verifikasi Terstuck di "Memuat data verifikasi..."

Jika halaman verifikasi tidak menampilkan hasil dan hanya stuck di loading, ikuti langkah berikut:

### 1. Buka Browser Console (Penting!)
Tekan **F12** di browser untuk membuka Developer Tools, lalu buka tab **Console**.

Anda akan melihat log seperti:
- `Verification page loaded. ID: 3 Nonce: ...`
- `Fetching verification data from: http://192.168.18.5:3000/api/verify?...`
- `Response data: {...}`

**Jika ada error merah di console, copy error tersebut dan lihat solusinya di bawah.**

### 2. Cek Apakah Server Berjalan
Pastikan server Node.js sedang berjalan:
```bash
npm start
```

Server harus menampilkan: `Server berjalan di http://localhost:3000`

### 3. Test API Endpoint Langsung
Buka di browser atau gunakan tool seperti Postman:
```
http://192.168.18.5:3000/api/verify?id=3&nonce=591f4497-df93-4182-92f0-7bc3c42b6ebc
```

**Response yang benar:**
```json
{
  "status": "VERIFIED",
  "data": {
    "nomor_surat": "...",
    "perihal": "...",
    "penandatangan": "...",
    "tanggal_surat": "...",
    "download_url": "/download/3"
  }
}
```

**Jika error 404 atau 500:**
- Cek apakah ID dan nonce benar
- Cek apakah data ada di database
- Lihat error di terminal server

### 4. Common Errors dan Solusi

#### Error: "Failed to fetch" atau "Network Error"
**Penyebab:** Server tidak berjalan atau alamat IP salah

**Solusi:**
- Pastikan server berjalan di terminal
- Cek IP address server (bukan IP device yang akses)
- Pastikan firewall tidak memblokir port 3000
- Coba akses dari `localhost:3000` dulu

#### Error: "CORS policy"
**Penyebab:** Masalah CORS configuration

**Solusi:**
- Server sudah menggunakan `cors()` middleware
- Jika masih error, cek apakah akses dari domain/IP yang berbeda
- Pastikan URL di browser sama dengan BASE_URL server

#### Error: "404 Not Found" pada `/api/verify`
**Penyebab:** Route tidak terdaftar atau server tidak reload

**Solusi:**
- Restart server: tekan `Ctrl+C` lalu `npm start` lagi
- Cek apakah `server.js` memiliki route `/api/verify`

#### Error: "ID tidak valid" atau "Nonce tidak valid"
**Penyebab:** Parameter URL tidak sesuai format

**Solusi:**
- ID harus angka (integer)
- Nonce harus UUID format
- Pastikan QR Code masih valid dan bukan hasil scan lama

#### Halaman Tetap Loading (Tidak Ada Error)
**Penyebab:** JavaScript tidak mengeksekusi atau fetch tidak complete

**Solusi:**
1. Buka Console (F12) - apakah ada log?
2. Refresh halaman dengan `Ctrl+F5` (hard refresh)
3. Clear cache browser
4. Cek Network tab di Developer Tools:
   - Apakah request ke `/api/verify` ada?
   - Apakah status response 200?
   - Apakah response body ada?

### 5. Verifikasi Database
Cek apakah data ada di database:
```bash
# Gunakan SQLite command line (jika tersedia)
sqlite3 data/signatures.db "SELECT id, nomor_surat, nonce FROM letters WHERE id=3;"
```

### 6. Cek Log Server
Lihat terminal dimana server berjalan. Jika ada error, akan muncul di sana:
```
Error in /api/verify: [error message]
```

### 7. Hard Refresh Browser
Kadang browser cache masalah. Coba:
- **Chrome/Edge:** `Ctrl + Shift + R` atau `Ctrl + F5`
- **Firefox:** `Ctrl + Shift + R`

### 8. Cek File JavaScript
Pastikan file `public/js/verify.js` ada dan bisa diakses:
```
http://192.168.18.5:3000/js/verify.js
```

Jika tidak bisa diakses, cek:
- Apakah file ada di folder `public/js/`?
- Apakah server static files sudah dikonfigurasi di `server.js`?

## Jika Masih Tidak Berfungsi

1. **Stop server** (`Ctrl+C`)
2. **Restart server**: `npm start`
3. **Buka halaman verifikasi lagi**
4. **Buka Console (F12)** dan lihat error message
5. **Copy error message** dan kirimkan untuk troubleshooting lebih lanjut

## Catatan
- Pastikan menggunakan QR Code terbaru (bukan foto/scan lama)
- Pastikan akses dari jaringan Wi-Fi yang sama
- Jika akses dari mobile, pastikan IP address benar

