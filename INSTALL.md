# ⚡ Quick Install Guide

Panduan instalasi cepat untuk menjalankan aplikasi Digital Signature Verification.

---

## ✅ Prasyarat

- Node.js 14+ ([Download](https://nodejs.org/))
- npm (otomatis terinstall dengan Node.js)
- Git ([Download](https://git-scm.com/))

**Cek versi:**
```bash
node --version
npm --version
git --version
```

---

## 🚀 Install & Run (3 Langkah)

### 1. Clone Repository
```bash
git clone https://github.com/Muwial/Keamanan-Sistem-Informasi.git
cd Keamanan-Sistem-Informasi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Server
```bash
npm start
```

**✅ Selesai!** Buka browser: `http://localhost:3000`

---

## 📱 Akses dari HP (Wi-Fi yang Sama)

1. Cari IP lokal:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. Akses dari HP:
   ```
   http://192.168.1.10:3000
   ```
   (Ganti dengan IP Anda)

---

## ❌ Troubleshooting

### Port 3000 sudah digunakan?
```bash
# Windows
set PORT=3001
npm start

# macOS/Linux
export PORT=3001
npm start
```

### Dependencies error?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Masih error?
Lihat **[TUTORIAL_SETUP.md](./TUTORIAL_SETUP.md)** untuk panduan lengkap.

---

## 📚 Dokumentasi Lengkap

- **[TUTORIAL_SETUP.md](./TUTORIAL_SETUP.md)** - Tutorial setup lengkap
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Requirements detail
- **[HOW_TO_RUN.md](./HOW_TO_RUN.md)** - Panduan menjalankan
- **[CARA_MENGGUNAKAN.md](./CARA_MENGGUNAKAN.md)** - User manual

---

**Selamat menggunakan! 🎉**

