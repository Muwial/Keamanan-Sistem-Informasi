# 📚 Tutorial Setup Aplikasi Digital Signature Verification

Tutorial lengkap untuk clone repository dan menjalankan aplikasi secara lokal.

---

## 📋 Requirements (Prasyarat)

### 1. Node.js
- **Versi Minimum**: Node.js 14.x atau lebih baru
- **Versi Direkomendasikan**: Node.js 16.x, 18.x, atau 20.x LTS
- **Cara Cek Versi**:
  ```bash
  node --version
  npm --version
  ```

### 2. npm (Node Package Manager)
- Biasanya sudah terinstall bersama Node.js
- **Cara Cek**: `npm --version`
- **Versi Minimum**: npm 6.x atau lebih baru

### 3. Git
- **Windows**: Download dari [git-scm.com](https://git-scm.com/download/win)
- **Cara Cek**: `git --version`

### 4. Sistem Operasi
- ✅ Windows 10/11
- ✅ macOS
- ✅ Linux (Ubuntu, Debian, dll)

### 5. Browser Modern
- Chrome, Firefox, Edge, atau Safari (versi terbaru)

### 6. Koneksi Internet
- Diperlukan untuk clone repository dan install dependencies

---

## 🚀 Langkah-langkah Setup

### **Langkah 1: Install Node.js (Jika Belum Ada)**

#### Windows:
1. Download Node.js LTS dari [nodejs.org](https://nodejs.org/)
2. Jalankan installer (`.msi`)
3. Ikuti wizard instalasi (pilih default options)
4. Restart Command Prompt/PowerShell
5. Verifikasi instalasi:
   ```bash
   node --version
   npm --version
   ```

#### macOS:
```bash
# Menggunakan Homebrew
brew install node

# Atau download dari nodejs.org
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install nodejs npm
```

---

### **Langkah 2: Clone Repository dari GitHub**

1. **Buka Command Prompt (Windows) atau Terminal (macOS/Linux)**

2. **Navigasi ke folder tempat Anda ingin menyimpan project**:
   ```bash
   cd D:\Projects
   # atau
   cd ~/Projects
   ```

3. **Clone repository**:
   ```bash
   git clone https://github.com/Muwial/Keamanan-Sistem-Informasi.git
   ```

4. **Masuk ke folder project**:
   ```bash
   cd Keamanan-Sistem-Informasi
   ```

5. **Verifikasi file sudah ter-clone**:
   ```bash
   dir
   # atau di Linux/macOS:
   ls -la
   ```

   Anda harus melihat file seperti:
   - `package.json`
   - `server.js`
   - `db.js`
   - `public/`
   - `README.md`

---

### **Langkah 3: Install Dependencies**

1. **Pastikan Anda berada di folder project**:
   ```bash
   cd Keamanan-Sistem-Informasi
   ```

2. **Install semua package yang diperlukan**:
   ```bash
   npm install
   ```

   Proses ini akan:
   - Membaca `package.json`
   - Download dan install semua dependencies (express, sqlite3, qrcode, dll)
   - Membuat folder `node_modules/`
   - Membuat file `package-lock.json`

3. **Tunggu hingga selesai** (biasanya 1-3 menit)

4. **Verifikasi instalasi berhasil**:
   ```bash
   # Cek apakah node_modules ada
   dir node_modules
   # atau
   ls node_modules
   ```

   Jika ada banyak folder di dalam `node_modules`, berarti instalasi berhasil ✅

---

### **Langkah 4: Setup Database**

Database SQLite akan dibuat **otomatis** saat pertama kali menjalankan server. Tidak perlu setup manual.

Namun, jika ingin memastikan struktur database benar, Anda bisa:

1. **Cek apakah folder `data/` ada**:
   ```bash
   dir data
   ```

2. **Jika tidak ada, folder akan dibuat otomatis saat server pertama kali dijalankan**

---

### **Langkah 5: Menjalankan Aplikasi**

#### **Cara 1: Menggunakan npm start (Recommended)**
```bash
npm start
```

#### **Cara 2: Menggunakan node langsung**
```bash
node server.js
```

#### **Output yang Diharapkan**:
```
Server berjalan di http://localhost:3000
Database initialized
```

✅ **Jika melihat pesan di atas, server berhasil berjalan!**

---

### **Langkah 6: Verifikasi Aplikasi Berjalan**

1. **Buka browser** (Chrome, Firefox, Edge)

2. **Akses halaman berikut**:

   - **Halaman Input Surat**: 
     ```
     http://localhost:3000
     ```
   
   - **Dashboard Admin**: 
     ```
     http://localhost:3000/admin
     ```
   
   - **Halaman Verifikasi** (contoh):
     ```
     http://localhost:3000/verify?id=1&nonce=xxx
     ```

3. **Jika halaman terbuka dengan benar**, berarti aplikasi sudah berjalan! 🎉

---

## 🌐 Akses dari Perangkat Lain (HP/Laptop di Wi-Fi yang Sama)

### **Windows:**

1. **Cari IP Address lokal Anda**:
   ```bash
   ipconfig
   ```
   
   Cari baris **"IPv4 Address"**, contoh: `192.168.1.10`

2. **Akses dari HP/laptop lain**:
   ```
   http://192.168.1.10:3000
   ```

### **macOS/Linux:**

1. **Cari IP Address lokal**:
   ```bash
   ifconfig
   # atau
   ip addr
   ```
   
   Cari IP di interface `en0` (macOS) atau `eth0`/`wlan0` (Linux)

2. **Akses dari perangkat lain**:
   ```
   http://192.168.1.10:3000
   ```

---

## 🔧 Troubleshooting (Pemecahan Masalah)

### **Error 1: 'node' is not recognized**

**Penyebab**: Node.js belum terinstall atau PATH belum di-set

**Solusi**:
1. Install Node.js dari [nodejs.org](https://nodejs.org/)
2. Restart Command Prompt/Terminal
3. Verifikasi: `node --version`

---

### **Error 2: Port 3000 sudah digunakan (EADDRINUSE)**

**Penyebab**: Port 3000 sedang digunakan aplikasi lain

**Solusi 1 - Gunakan port lain**:
```bash
# Windows
set PORT=3001
npm start

# macOS/Linux
export PORT=3001
npm start
```

**Solusi 2 - Tutup aplikasi yang menggunakan port 3000**:
```bash
# Windows - Cari process yang menggunakan port 3000
netstat -ano | findstr :3000
# Lalu kill process dengan PID yang muncul
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

### **Error 3: npm install gagal / network error**

**Penyebab**: Koneksi internet bermasalah atau registry npm tidak bisa diakses

**Solusi 1 - Cek koneksi internet**:
```bash
ping google.com
```

**Solusi 2 - Clear npm cache**:
```bash
npm cache clean --force
npm install
```

**Solusi 3 - Gunakan registry alternatif**:
```bash
npm install --registry https://registry.npmjs.org/
```

---

### **Error 4: Module not found / Cannot find module**

**Penyebab**: Dependencies belum terinstall dengan benar

**Solusi**:
```bash
# Hapus node_modules dan package-lock.json
rmdir /s node_modules
del package-lock.json

# Install ulang
npm install
```

**Untuk macOS/Linux**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### **Error 5: Database error / SQLite error**

**Penyebab**: Folder `data/` tidak ada atau permission error

**Solusi**:
1. Buat folder `data/` secara manual:
   ```bash
   mkdir data
   ```
2. Pastikan folder memiliki permission write (Linux/macOS):
   ```bash
   chmod 755 data
   ```

---

### **Error 6: QR Code tidak muncul**

**Penyebab**: Folder `qrcodes/` tidak ada atau permission error

**Solusi**:
1. Buat folder `qrcodes/`:
   ```bash
   mkdir qrcodes
   ```
2. Pastikan permission write (Linux/macOS):
   ```bash
   chmod 755 qrcodes
   ```

---

### **Error 7: Upload file gagal**

**Penyebab**: Folder `uploads/` atau `signatures/` tidak ada

**Solusi**:
1. Buat folder yang diperlukan:
   ```bash
   mkdir uploads
   mkdir signatures
   ```
2. Pastikan permission write (Linux/macOS):
   ```bash
   chmod 755 uploads signatures
   ```

---

## 📁 Struktur Folder Setelah Setup

```
Keamanan-Sistem-Informasi/
├── data/
│   └── signatures.db          # Database SQLite (auto-generated)
├── node_modules/              # Dependencies (auto-generated)
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── admin.js
│   │   ├── main.js
│   │   └── verify.js
│   ├── admin.html
│   ├── index.html
│   └── verify.html
├── qrcodes/                   # QR Code images (auto-generated)
├── signatures/                # Signature images (auto-generated)
├── uploads/                   # Uploaded PDF files (auto-generated)
├── db.js
├── package.json
├── package-lock.json
├── README.md
├── schema.sql
└── server.js
```

---

## ✅ Checklist Setup

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan:

- [ ] Node.js terinstall (versi 14+)
- [ ] npm terinstall
- [ ] Git terinstall
- [ ] Repository berhasil di-clone
- [ ] Dependencies berhasil di-install (`npm install`)
- [ ] Folder `node_modules/` ada dan berisi banyak package
- [ ] Server berhasil dijalankan (`npm start`)
- [ ] Tidak ada error di terminal
- [ ] Halaman `http://localhost:3000` bisa diakses
- [ ] Halaman `http://localhost:3000/admin` bisa diakses

---

## 🎯 Quick Start (Ringkasan Cepat)

Untuk yang sudah familiar dengan Node.js, berikut ringkasan cepat:

```bash
# 1. Clone repository
git clone https://github.com/Muwial/Keamanan-Sistem-Informasi.git
cd Keamanan-Sistem-Informasi

# 2. Install dependencies
npm install

# 3. Jalankan server
npm start

# 4. Buka browser
# http://localhost:3000
```

---

## 📞 Bantuan Tambahan

Jika masih mengalami masalah:

1. **Cek log error** di terminal untuk detail error
2. **Pastikan semua requirements terpenuhi** (Node.js versi, dll)
3. **Cek dokumentasi** di `README.md` dan file `.md` lainnya
4. **Buat issue di GitHub** dengan detail error yang terjadi

---

## 🎉 Selamat!

Jika semua langkah di atas berhasil, aplikasi Digital Signature Verification sudah siap digunakan!

**Fitur yang tersedia**:
- ✅ Input surat dengan upload PDF dan tanda tangan
- ✅ Generate QR Code dengan hash SHA-256
- ✅ Verifikasi digital signature
- ✅ Dashboard admin untuk mengelola data
- ✅ Export ke Excel dengan QR Code

**Selamat menggunakan aplikasi!** 🚀

