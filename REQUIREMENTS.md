# 📋 Requirements (Prasyarat Sistem)

Dokumen ini menjelaskan semua requirements yang diperlukan untuk menjalankan aplikasi Digital Signature Verification.

---

## 🖥️ System Requirements

### **Minimum Requirements**
- **RAM**: 2 GB
- **Storage**: 500 MB (untuk dependencies dan file upload)
- **Processor**: Dual-core 1.5 GHz atau lebih baik

### **Recommended Requirements**
- **RAM**: 4 GB atau lebih
- **Storage**: 1 GB atau lebih
- **Processor**: Quad-core 2.0 GHz atau lebih baik

---

## 💻 Software Requirements

### **1. Node.js**
- **Versi Minimum**: Node.js 14.x
- **Versi Direkomendasikan**: Node.js 16.x, 18.x, atau 20.x LTS
- **Download**: [https://nodejs.org/](https://nodejs.org/)
- **Cara Cek Versi**:
  ```bash
  node --version
  ```
- **Catatan**: Pilih versi LTS (Long Term Support) untuk stabilitas

### **2. npm (Node Package Manager)**
- **Versi Minimum**: npm 6.x
- **Versi Direkomendasikan**: npm 8.x atau lebih baru
- **Cara Cek Versi**:
  ```bash
  npm --version
  ```
- **Catatan**: npm biasanya sudah terinstall bersama Node.js

### **3. Git**
- **Versi Minimum**: Git 2.0 atau lebih baru
- **Download**:
  - Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
  - macOS: `brew install git` atau download dari [git-scm.com](https://git-scm.com/download/mac)
  - Linux: `sudo apt install git` (Ubuntu/Debian)
- **Cara Cek Versi**:
  ```bash
  git --version
  ```

### **4. Sistem Operasi**
Aplikasi ini kompatibel dengan:

#### **Windows**
- Windows 10 (64-bit)
- Windows 11 (64-bit)
- Windows Server 2016 atau lebih baru

#### **macOS**
- macOS 10.15 (Catalina) atau lebih baru
- macOS 11.x (Big Sur)
- macOS 12.x (Monterey)
- macOS 13.x (Ventura)
- macOS 14.x (Sonoma)

#### **Linux**
- Ubuntu 18.04 LTS atau lebih baru
- Debian 10 atau lebih baru
- CentOS 7 atau lebih baru
- Fedora 30 atau lebih baru

### **5. Browser Modern**
Aplikasi web ini memerlukan browser modern dengan dukungan:
- **JavaScript ES6+**
- **Fetch API**
- **Local Storage**

**Browser yang Didukung**:
- ✅ Google Chrome 90+ (Recommended)
- ✅ Mozilla Firefox 88+
- ✅ Microsoft Edge 90+
- ✅ Safari 14+ (macOS)
- ✅ Opera 76+

### **6. Koneksi Internet**
- **Diperlukan untuk**:
  - Clone repository dari GitHub
  - Install dependencies dari npm registry
- **Tidak diperlukan saat runtime** (aplikasi berjalan secara lokal)

---

## 📦 Dependencies (Package Requirements)

Semua dependencies akan terinstall otomatis saat menjalankan `npm install`. Berikut daftarnya:

### **Core Dependencies**
| Package | Versi | Deskripsi |
|---------|-------|-----------|
| `express` | ^4.19.2 | Web framework untuk Node.js |
| `sqlite3` | ^5.1.7 | Database SQLite |
| `multer` | ^1.4.5-lts.1 | Middleware untuk handle file upload |
| `qrcode` | ^1.5.4 | Generate QR Code |
| `exceljs` | ^4.4.0 | Generate file Excel |
| `uuid` | ^9.0.1 | Generate unique identifier |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `helmet` | ^7.1.0 | Security headers (optional) |
| `express-validator` | ^7.0.1 | Input validation & sanitization |

### **Node.js Built-in Modules**
Tidak perlu install, sudah termasuk dengan Node.js:
- `fs` - File system operations
- `path` - Path utilities
- `crypto` - Cryptographic functions (SHA-256)
- `os` - Operating system utilities
- `http` - HTTP server

---

## 🔧 Development Tools (Opsional)

Tools berikut **tidak wajib** tetapi berguna untuk development:

### **Nodemon** (Auto-restart server)
- **Install**: `npm install -g nodemon`
- **Kegunaan**: Auto-restart server saat file berubah
- **Cara Pakai**: `npm run dev` (jika sudah dikonfigurasi)

### **Postman / Insomnia** (API Testing)
- **Kegunaan**: Testing API endpoints
- **Download**: 
  - Postman: [postman.com](https://www.postman.com/downloads/)
  - Insomnia: [insomnia.rest](https://insomnia.rest/download)

---

## 📁 Folder Structure Requirements

Aplikasi akan membuat folder berikut secara otomatis saat pertama kali dijalankan:

### **Folder yang Dibutuhkan**
- `data/` - Untuk menyimpan database SQLite
- `uploads/` - Untuk menyimpan file PDF yang diupload
- `signatures/` - Untuk menyimpan gambar tanda tangan
- `qrcodes/` - Untuk menyimpan file QR Code yang di-generate

### **Permission Requirements**
- **Windows**: Tidak ada masalah permission
- **macOS/Linux**: Folder harus memiliki permission **write** (755 atau 777)

---

## 🌐 Network Requirements

### **Port**
- **Default Port**: 3000
- **Port yang Digunakan**: Harus tersedia dan tidak digunakan aplikasi lain
- **Cara Cek Port Terpakai**:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  
  # macOS/Linux
  lsof -i :3000
  ```

### **Firewall**
- Jika ingin akses dari perangkat lain di jaringan yang sama:
  - **Windows**: Allow Node.js melalui Windows Firewall
  - **macOS**: Allow incoming connections di System Preferences
  - **Linux**: Buka port 3000 di firewall (ufw/iptables)

---

## ✅ Checklist Requirements

Gunakan checklist ini untuk memastikan semua requirements terpenuhi:

### **Software**
- [ ] Node.js terinstall (versi 14+)
- [ ] npm terinstall (versi 6+)
- [ ] Git terinstall (versi 2+)
- [ ] Browser modern terinstall

### **System**
- [ ] RAM minimal 2 GB tersedia
- [ ] Storage minimal 500 MB tersedia
- [ ] Port 3000 tersedia (tidak digunakan aplikasi lain)

### **Network** (Opsional - untuk akses dari perangkat lain)
- [ ] Koneksi internet untuk clone & install dependencies
- [ ] Firewall dikonfigurasi (jika perlu)

---

## 🚀 Quick Verification

Jalankan perintah berikut untuk memverifikasi semua requirements:

```bash
# Cek Node.js
node --version
# Output: v14.x.x atau lebih tinggi

# Cek npm
npm --version
# Output: 6.x.x atau lebih tinggi

# Cek Git
git --version
# Output: git version 2.x.x atau lebih tinggi

# Cek port 3000 (jika error berarti port tersedia)
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000
```

---

## 📚 Referensi

- **Node.js Documentation**: [https://nodejs.org/docs/](https://nodejs.org/docs/)
- **npm Documentation**: [https://docs.npmjs.com/](https://docs.npmjs.com/)
- **Git Documentation**: [https://git-scm.com/doc](https://git-scm.com/doc)
- **Express.js Documentation**: [https://expressjs.com/](https://expressjs.com/)

---

## ❓ Troubleshooting Requirements

### **Node.js tidak terdeteksi**
- Pastikan Node.js terinstall dengan benar
- Restart terminal/command prompt
- Cek PATH environment variable

### **npm command not found**
- npm biasanya terinstall bersama Node.js
- Reinstall Node.js jika npm tidak terdeteksi

### **Port 3000 sudah digunakan**
- Gunakan port lain dengan `set PORT=3001` (Windows) atau `export PORT=3001` (macOS/Linux)
- Atau tutup aplikasi yang menggunakan port 3000

---

**Selanjutnya**: Lihat [TUTORIAL_SETUP.md](./TUTORIAL_SETUP.md) untuk langkah-langkah setup lengkap.

