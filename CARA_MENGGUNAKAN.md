# PANDUAN PENGGUNAAN SISTEM
## Verifikasi Tanda Tangan Digital

---

## 📋 DAFTAR ISI

1. [Persiapan](#1-persiapan)
2. [Menjalankan Aplikasi](#2-menjalankan-aplikasi)
3. [Input Surat Baru](#3-input-surat-baru)
4. [Verifikasi Surat](#4-verifikasi-surat)
5. [Dashboard Admin](#5-dashboard-admin)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. PERSIAPAN

### 1.1 Sistem Requirements

**Minimum Requirements:**
- **OS**: Windows 10/11, macOS, atau Linux
- **Node.js**: Versi 14 atau lebih baru
- **RAM**: Minimal 2GB
- **Storage**: Minimal 100MB untuk aplikasi + space untuk file upload

**Recommended:**
- **Node.js**: Versi 18 LTS atau lebih baru
- **RAM**: 4GB atau lebih
- **Browser**: Chrome, Firefox, Edge (versi terbaru)

### 1.2 Instalasi Node.js

1. Download Node.js dari https://nodejs.org/
2. Install dengan default settings
3. Verify instalasi:
   ```bash
   node --version
   npm --version
   ```

### 1.3 Setup Project

```bash
# 1. Buka terminal/command prompt
# 2. Navigate ke folder project
cd "D:\Keamanan Sistem Informasi part 2"

# 3. Install dependencies
npm install

# Tunggu hingga proses selesai (beberapa menit)
```

---

## 2. MENJALANKAN APLIKASI

### 2.1 Menjalankan Server

**Mode Production:**
```bash
npm start
```

**Mode Development (dengan auto-reload):**
```bash
npm run dev
```

**Output yang Diharapkan:**
```
Server berjalan di http://localhost:3000
```

### 2.2 Mengakses Aplikasi

1. **Dari Komputer yang Sama:**
   - Buka browser
   - Akses: `http://localhost:3000`

2. **Dari Perangkat Lain (Mobile/Network):**
   - Cari IP lokal komputer:
     - **Windows**: Buka Command Prompt, ketik `ipconfig`
     - Cari "IPv4 Address" (contoh: `192.168.1.10`)
   - Pastikan perangkat terhubung ke Wi-Fi yang sama
   - Akses: `http://192.168.1.10:3000` (ganti dengan IP Anda)

### 2.3 Menghentikan Server

Tekan `Ctrl + C` di terminal untuk menghentikan server.

---

## 3. INPUT SURAT BARU

### 3.1 Membuka Halaman Input

1. Buka browser
2. Akses: `http://localhost:3000`
3. Atau klik "Input Surat" dari dashboard admin

### 3.2 Mengisi Form

#### Langkah 1: Data Surat
1. **Nomor Surat** (Wajib)
   - Masukkan nomor surat (contoh: `123/DS/2025`)
   - ⚠️ Harus unik, tidak boleh sama dengan yang sudah ada
   - Format bebas (huruf, angka, slash)

2. **Perihal** (Wajib)
   - Masukkan perihal surat
   - Contoh: "Surat Keterangan", "Surat Tugas", dll

3. **Nama Penandatangan** (Wajib)
   - Masukkan nama lengkap penandatangan
   - Contoh: "Dr. Ahmad Hidayat, S.Kom., M.Kom."

4. **Tanggal Surat** (Wajib)
   - Klik field tanggal
   - Pilih tanggal dari date picker
   - Format: YYYY-MM-DD

#### Langkah 2: Upload File (Opsional)

**Upload File Surat PDF:**
1. Klik "Choose File" di bagian "Upload File Surat"
2. Pilih file PDF dari komputer
3. ⚠️ Maksimal 5MB
4. Nama file akan muncul setelah dipilih

**Upload Gambar Tanda Tangan:**
1. Klik "Choose File" di bagian "Upload Gambar Tanda Tangan"
2. Pilih file JPG atau PNG
3. ⚠️ Maksimal 2MB
4. Preview gambar akan muncul otomatis
5. Pastikan gambar jelas dan dapat dibaca

### 3.3 Submit Form

1. Klik tombol **"Simpan & Generate QR"**
2. Tunggu proses (tombol akan menampilkan "Menyimpan...")
3. Jika berhasil, akan muncul:
   - ✅ Status: "QR Code berhasil dibuat"
   - Preview QR Code
   - Hash Code (SHA-256)
   - Tombol "Download QR Code"
   - Link "Buka Halaman Verifikasi"

### 3.4 Download QR Code

1. Setelah QR Code berhasil dibuat
2. Klik tombol **"📥 Download QR Code"**
3. File akan terdownload dengan nama: `qr-code-{id}-{hash8chars}.png`
4. QR Code siap digunakan untuk verifikasi

### 3.5 Error Handling

**Jika Error "Nomor surat sudah terdaftar":**
- Nomor surat yang Anda masukkan sudah ada di database
- Solusi:
  1. Gunakan nomor surat yang berbeda
  2. Atau hapus data lama dari dashboard admin
  3. Cek di dashboard admin apakah nomor surat sudah ada

**Jika Error Upload File:**
- Pastikan file tidak melebihi ukuran maksimal
- Pastikan format file sesuai (PDF untuk surat, JPG/PNG untuk tanda tangan)
- Coba dengan file yang lebih kecil

---

## 4. VERIFIKASI SURAT

### 4.1 Metode Verifikasi

#### Metode 1: Scan QR Code (Recommended)

1. **Dari Smartphone:**
   - Buka aplikasi scanner QR Code (bawaan atau download)
   - Scan QR Code yang sudah di-generate
   - Browser akan otomatis membuka halaman verifikasi

2. **Dari Komputer:**
   - Gunakan aplikasi scanner QR Code
   - Atau gunakan webcam untuk scan
   - Browser akan membuka URL verifikasi

#### Metode 2: Manual URL

1. Copy URL verifikasi dari:
   - Halaman input (setelah QR dibuat)
   - Dashboard admin (kolom "Buka Verifikasi")
2. Paste URL di browser
3. Halaman verifikasi akan dimuat

### 4.2 Hasil Verifikasi

#### Status: ✅ VERIFIED

Jika surat valid, akan menampilkan:

1. **Status Badge**: ✅ VERIFIED (hijau)
2. **Pesan**: "Surat terverifikasi dan sah"
3. **Data Surat**:
   - Nomor Surat
   - Perihal
   - Nama Penandatangan
   - Tanggal Surat
4. **File**:
   - Tombol "Download Surat PDF" (jika ada)
   - Gambar Tanda Tangan (jika ada)
5. **Informasi Hash**:
   - ✅ Status: "Integritas Data Terverifikasi"
   - Data Hash (SHA-256): hash lengkap
   - Signature Hash (SHA-256): hash tanda tangan (jika ada)
   - Waktu Pembuatan: timestamp

#### Status: ❌ INVALID

Jika surat tidak valid, akan menampilkan:

1. **Status Badge**: ❌ TIDAK VALID (merah)
2. **Pesan Error**: Alasan ketidakvalidan
3. **Instruksi**: Tips troubleshooting

### 4.3 Download File dari Halaman Verifikasi

1. Jika ada file surat PDF:
   - Klik tombol "📄 Download Surat PDF"
   - File akan terdownload

2. Jika ada tanda tangan:
   - Gambar akan ditampilkan otomatis
   - Klik kanan → Save Image untuk download

---

## 5. DASHBOARD ADMIN

### 5.1 Mengakses Dashboard

1. Buka browser
2. Akses: `http://localhost:3000/admin`
3. Atau klik "Dashboard Admin" dari halaman input

### 5.2 Fitur Dashboard

#### 5.2.1 Tabel Data

Tabel menampilkan semua surat yang sudah diinput dengan kolom:

- **No**: Nomor urut
- **Nomor Surat**: Nomor surat yang diinput
- **Perihal**: Perihal surat
- **Penandatangan**: Nama penandatangan
- **Tanggal**: Tanggal surat
- **QR & Hash**: 
  - Preview QR Code (klik untuk download)
  - Hash code di bawah QR (12 karakter pertama)
- **Aksi**: Tombol-tombol aksi

#### 5.2.2 Aksi yang Tersedia

**Download QR:**
- Klik tombol "Download QR"
- File akan terdownload dengan nama: `qr-code-{id}-{hash8chars}.png`

**Buka Verifikasi:**
- Klik tombol "Buka Verifikasi"
- Halaman verifikasi akan terbuka di tab baru

**Download Surat:**
- Klik tombol "Download Surat" (jika ada file PDF)
- File PDF akan terdownload

**Lihat Tanda Tangan:**
- Klik tombol "Lihat Tanda Tangan" (jika ada)
- Gambar akan terbuka di tab baru

**Hapus:**
- Klik tombol "Hapus" (merah)
- Konfirmasi penghapusan
- Data, file, dan QR Code akan dihapus

#### 5.2.3 Export ke Excel

1. Klik tombol **"Export ke Excel"** di header
2. File Excel akan terdownload
3. File berisi:
   - Semua data surat
   - Data Hash (SHA-256) lengkap
   - Signature Hash (SHA-256) lengkap
   - QR Code sebagai gambar

### 5.3 Mobile View

Di mobile, tabel akan:
- Scroll horizontal untuk melihat semua kolom
- Tombol aksi akan full-width
- Layout lebih compact

---

## 6. TROUBLESHOOTING

### 6.1 Server Tidak Berjalan

**Gejala:**
- Browser menampilkan "This site can't be reached"
- Error connection refused

**Solusi:**
1. Pastikan server sedang berjalan (cek terminal)
2. Pastikan port 3000 tidak digunakan aplikasi lain
3. Restart server: `npm start`
4. Coba port lain: set `PORT=3001` lalu `npm start`

### 6.2 Hash Menampilkan "N/A"

**Gejala:**
- Hash code menampilkan "N/A" di dashboard

**Solusi:**
1. Refresh halaman dashboard admin
2. Sistem akan otomatis generate hash untuk data lama
3. Hash akan muncul setelah refresh

### 6.3 QR Code Tidak Muncul

**Gejala:**
- QR Code tidak muncul setelah submit
- Error saat download QR Code

**Solusi:**
1. Pastikan folder `qrcodes/` ada
2. Cek permission folder (harus writable)
3. Restart server
4. Coba submit ulang

### 6.4 File Tidak Ter-upload

**Gejala:**
- File tidak ter-upload setelah submit
- Error saat upload

**Solusi:**
1. **Cek Ukuran File:**
   - PDF: Maksimal 5MB
   - Tanda Tangan: Maksimal 2MB
2. **Cek Format File:**
   - PDF: Harus file PDF asli
   - Tanda Tangan: Harus JPG atau PNG
3. **Cek Permission:**
   - Pastikan folder `uploads/` dan `signatures/` writable
4. **Cek Space Disk:**
   - Pastikan ada space cukup di harddisk

### 6.5 Verifikasi Tidak Berfungsi

**Gejala:**
- Halaman verifikasi stuck di "Memuat data verifikasi..."
- Error saat verifikasi

**Solusi:**
1. **Cek URL:**
   - Pastikan URL lengkap dengan ID dan nonce
   - Format: `/verify?id=1&nonce=uuid-here`
2. **Cek Server:**
   - Pastikan server sedang berjalan
   - Cek console server untuk error
3. **Cek Database:**
   - Pastikan data ada di database
   - Cek ID dan nonce sesuai
4. **Clear Browser Cache:**
   - Tekan `Ctrl + Shift + Delete`
   - Clear cache dan cookies
   - Refresh halaman

### 6.6 Akses dari Mobile Tidak Bisa

**Gejala:**
- Tidak bisa akses dari smartphone
- QR Code tidak bisa di-scan

**Solusi:**
1. **Cek IP Address:**
   - Pastikan IP yang digunakan benar
   - IP harus dari komputer yang menjalankan server
2. **Cek Network:**
   - Pastikan smartphone dan komputer di Wi-Fi yang sama
   - Cek firewall tidak memblokir port 3000
3. **Cek URL:**
   - Pastikan menggunakan HTTP (bukan HTTPS)
   - Format: `http://192.168.x.x:3000`

### 6.7 Export Excel Error

**Gejala:**
- Export Excel tidak berfungsi
- File corrupt atau kosong

**Solusi:**
1. Pastikan ada data di database
2. Cek permission folder
3. Restart server
4. Coba export ulang

---

## TIPS PENGGUNAAN

### ✅ Best Practices

1. **Backup Data:**
   - Backup folder `data/` secara berkala
   - Backup file di `uploads/` dan `signatures/`

2. **Organisasi File:**
   - Gunakan nomor surat yang konsisten
   - Simpan QR Code di tempat aman
   - Dokumentasikan hash code untuk audit

3. **Keamanan:**
   - Jangan share URL verifikasi sembarangan
   - Simpan nonce dengan aman
   - Verifikasi hash secara berkala

4. **Performance:**
   - Hapus data lama yang tidak diperlukan
   - Compress file PDF sebelum upload
   - Optimize gambar tanda tangan (resize jika terlalu besar)

---

**Panduan ini dibuat untuk memudahkan penggunaan Sistem Verifikasi Tanda Tangan Digital**

