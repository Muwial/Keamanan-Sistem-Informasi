# PowerShell Script untuk Push ke GitHub
# Jalankan dengan: .\push-to-github.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Push ke GitHub - Automated Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $null = Get-Command git -ErrorAction Stop
} catch {
    Write-Host "[ERROR] Git tidak ditemukan!" -ForegroundColor Red
    Write-Host "Silakan install Git terlebih dahulu." -ForegroundColor Yellow
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

Write-Host "[1/4] Menambahkan semua perubahan..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Gagal menambahkan file!" -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

Write-Host "[2/4] Mengecek status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "[3/4] Membuat commit..." -ForegroundColor Yellow
$commitMsg = Read-Host "Masukkan pesan commit (atau tekan Enter untuk default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMsg = "Update: Automated commit - $timestamp"
}

git commit -m $commitMsg

if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Tidak ada perubahan untuk di-commit atau commit gagal." -ForegroundColor Yellow
    Write-Host "Melanjutkan ke push..." -ForegroundColor Yellow
} else {
    Write-Host "[SUCCESS] Commit berhasil dibuat!" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/4] Push ke GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] Push ke GitHub berhasil!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: https://github.com/Muwial/Keamanan-Sistem-Informasi" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  [ERROR] Push ke GitHub gagal!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Kemungkinan penyebab:" -ForegroundColor Yellow
    Write-Host "- Belum login ke GitHub"
    Write-Host "- Koneksi internet bermasalah"
    Write-Host "- Konflik dengan remote repository"
    Write-Host ""
    Write-Host "Coba jalankan: git push origin main" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Tekan Enter untuk keluar"

