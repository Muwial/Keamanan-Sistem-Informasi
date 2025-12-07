@echo off
echo ========================================
echo   Push ke GitHub - Automated Script
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git tidak ditemukan!
    echo Silakan install Git terlebih dahulu.
    pause
    exit /b 1
)

echo [1/4] Menambahkan semua perubahan...
git add .

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal menambahkan file!
    pause
    exit /b 1
)

echo [2/4] Mengecek status...
git status --short

echo.
echo [3/4] Membuat commit...
set /p commit_msg="Masukkan pesan commit (atau tekan Enter untuk default): "
if "%commit_msg%"=="" (
    set commit_msg=Update: Automated commit - %date% %time%
)

git commit -m "%commit_msg%"

if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Tidak ada perubahan untuk di-commit atau commit gagal.
    echo Melanjutkan ke push...
) else (
    echo [SUCCESS] Commit berhasil dibuat!
)

echo.
echo [4/4] Push ke GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   [SUCCESS] Push ke GitHub berhasil!
    echo ========================================
    echo.
    echo Repository: https://github.com/Muwial/Keamanan-Sistem-Informasi
) else (
    echo.
    echo ========================================
    echo   [ERROR] Push ke GitHub gagal!
    echo ========================================
    echo.
    echo Kemungkinan penyebab:
    echo - Belum login ke GitHub
    echo - Koneksi internet bermasalah
    echo - Konflik dengan remote repository
    echo.
    echo Coba jalankan: git push origin main
)

echo.
pause

