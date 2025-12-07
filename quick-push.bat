@echo off
REM Quick Push - Tanpa input, langsung push dengan pesan default
echo [Quick Push] Menambahkan perubahan...
git add . >nul 2>&1

echo [Quick Push] Membuat commit...
set timestamp=%date% %time%
git commit -m "Update: Automated commit - %timestamp%" >nul 2>&1

echo [Quick Push] Push ke GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Push berhasil!
) else (
    echo [ERROR] Push gagal! Cek koneksi atau jalankan push-to-github.bat untuk detail.
)

timeout /t 3 >nul

