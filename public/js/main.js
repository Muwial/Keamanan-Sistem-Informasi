// Wait for DOM to be ready
let form, statusText, resultBox, qrPreview, verificationLink, downloadQrBtn;
let signatureInput, signaturePreview, signaturePreviewImg, nomorSuratInput;

let currentQrId = null;

// Initialize when DOM is ready
function init() {
  form = document.getElementById('letterForm');
  statusText = document.getElementById('statusText');
  resultBox = document.getElementById('result');
  qrPreview = document.getElementById('qrPreview');
  verificationLink = document.getElementById('verificationLink');
  downloadQrBtn = document.getElementById('downloadQrBtn');
  signatureInput = document.getElementById('tanda_tangan');
  signaturePreview = document.getElementById('signaturePreview');
  signaturePreviewImg = document.getElementById('signaturePreviewImg');
  nomorSuratInput = document.getElementById('nomor_surat');

  // Check if required elements exist
  if (!form || !statusText || !resultBox) {
    console.error('Required elements not found. Make sure the page is fully loaded.');
    return false;
  }

  // Check nomor surat availability on blur
  if (nomorSuratInput && statusText) {
    let checkTimeout;
    nomorSuratInput.addEventListener('blur', function() {
      const nomorSurat = this.value.trim();
      if (!nomorSurat) return;
      
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/letters?check=${encodeURIComponent(nomorSurat)}`);
          const data = await res.json();
          if (data.exists && statusText) {
            statusText.textContent = `⚠️ Nomor surat "${nomorSurat}" sudah terdaftar (ID: ${data.id}). Gunakan nomor yang berbeda atau hapus data lama.`;
            statusText.style.color = '#f59e0b';
          } else if (statusText) {
            statusText.textContent = '';
          }
        } catch (err) {
          // Ignore check errors
        }
      }, 500);
    });
  }

  // Preview signature image
  if (signatureInput && signaturePreviewImg && signaturePreview) {
    signatureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          if (signaturePreviewImg) {
            signaturePreviewImg.src = event.target.result;
            signaturePreviewImg.style.display = 'block';
          }
          if (signaturePreview) {
            signaturePreview.classList.add('active');
          }
        };
        reader.readAsDataURL(file);
      } else {
        if (signaturePreview) {
          signaturePreview.classList.remove('active');
        }
        if (signaturePreviewImg) {
          signaturePreviewImg.style.display = 'none';
        }
      }
    });
  }

  // Download QR Code function
  if (downloadQrBtn) {
    downloadQrBtn.addEventListener('click', async function(e) {
      if (!currentQrId) return;
      
      e.preventDefault();
      try {
        const qrUrl = `/qrcodes/qr-${currentQrId}.png`;
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-code-${currentQrId}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error('Error downloading QR code:', err);
        // Fallback to direct link
        if (downloadQrBtn) {
          downloadQrBtn.target = '_blank';
        }
      }
    });
  }

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form || !statusText || !resultBox) {
      console.error('Required elements not found');
      return;
    }
    
    statusText.textContent = 'Menyimpan...';
    statusText.style.color = '';
    resultBox.style.display = 'none';

    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) {
      console.error('Submit button not found');
      return;
    }
    
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    const formData = new FormData(form);

    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server mengembalikan respons non-JSON: ${text.substring(0, 100)}`);
      }
      
      if (!res.ok) {
        let message = data?.message || data?.errors?.[0]?.msg || 'Gagal menyimpan surat';
        
        // Enhanced error message for duplicate
        if (res.status === 409 && data.existing_data && statusText && statusText.parentElement) {
          const existing = data.existing_data;
          
          // Remove any existing error div
          const existingErrorDiv = statusText.parentElement.querySelector('.duplicate-error');
          if (existingErrorDiv) existingErrorDiv.remove();
          
          // Create detailed error display
          const errorDiv = document.createElement('div');
          errorDiv.className = 'duplicate-error';
          errorDiv.style.cssText = 'margin-top:16px; padding:16px; background:rgba(239, 68, 68, 0.15); border:2px solid rgba(239, 68, 68, 0.3); border-radius:12px;';
          errorDiv.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
              <span style="font-size:20px;">⚠️</span>
              <strong style="color:#ef4444;">Nomor Surat Sudah Terdaftar</strong>
            </div>
            <div style="margin-bottom:12px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px;">
              <p style="margin:4px 0; color:#cbd5e1;"><strong>ID:</strong> ${existing.id}</p>
              <p style="margin:4px 0; color:#cbd5e1;"><strong>Perihal:</strong> ${existing.perihal}</p>
              <p style="margin:4px 0; color:#cbd5e1;"><strong>Penandatangan:</strong> ${existing.penandatangan}</p>
              <p style="margin:4px 0; color:#cbd5e1;"><strong>Tanggal:</strong> ${existing.tanggal_surat}</p>
              <p style="margin:4px 0; color:#cbd5e1;"><strong>Dibuat:</strong> ${existing.created_at}</p>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <a href="/admin" class="btn-primary" style="text-decoration:none; padding:10px 16px; font-size:14px;">📊 Buka Dashboard Admin</a>
              <button onclick="document.getElementById('nomor_surat').focus(); document.getElementById('nomor_surat').select();" class="btn-ghost" style="padding:10px 16px; font-size:14px;">✏️ Ubah Nomor Surat</button>
            </div>
          `;
          statusText.parentElement.appendChild(errorDiv);
        }
        
        if (statusText) {
          statusText.textContent = message;
          statusText.style.color = '#ef4444';
          statusText.style.whiteSpace = 'pre-line';
          statusText.style.lineHeight = '1.6';
        }
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        return;
      }

      const qrUrl = `/qrcodes/qr-${data.id}.png`;
      currentQrId = data.id;
      if (qrPreview) qrPreview.src = qrUrl;
      if (verificationLink) {
        verificationLink.href = data.verificationUrl;
        verificationLink.textContent = data.verificationUrl;
      }
      
      // Update download filename with hash
      const hashShort = data.data_hash ? data.data_hash.substring(0, 8) : '';
      if (downloadQrBtn) {
        downloadQrBtn.href = qrUrl;
        downloadQrBtn.download = `qr-code-${data.id}-${hashShort}.png`;
      }
      
      // Display hash information
      const hashInfo = document.getElementById('hashInfo');
      const dataHashDisplay = document.getElementById('dataHashDisplay');
      const signatureHashDisplay = document.getElementById('signatureHashDisplay');
      
      if (data.data_hash) {
        if (dataHashDisplay) {
          dataHashDisplay.textContent = data.data_hash;
        }
        if (hashInfo) {
          hashInfo.style.display = 'block';
        }
        
        if (data.signature_hash && signatureHashDisplay) {
          signatureHashDisplay.textContent = `Signature: ${data.signature_hash}`;
          signatureHashDisplay.style.display = 'block';
        } else if (signatureHashDisplay) {
          signatureHashDisplay.style.display = 'none';
        }
      } else if (hashInfo) {
        hashInfo.style.display = 'none';
      }
      
      if (resultBox) resultBox.style.display = 'block';
      if (statusText) {
        statusText.textContent = '✓ Berhasil disimpan';
        statusText.style.color = '#10b981';
      }
      if (form) form.reset();
      if (signaturePreview) signaturePreview.classList.remove('active');
      if (signaturePreviewImg) signaturePreviewImg.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
      
      // Scroll to result
      if (resultBox) resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('Error submitting form:', err);
      
      // Remove any existing error div
      if (statusText && statusText.parentElement) {
        const existingErrorDiv = statusText.parentElement.querySelector('.duplicate-error');
        if (existingErrorDiv) existingErrorDiv.remove();
      }
      
      let errorMessage = '❌ Terjadi kesalahan saat menyimpan surat.';
      
      // More specific error messages
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        errorMessage = '❌ Gagal terhubung ke server.\n\nPastikan:\n• Server sedang berjalan\n• Koneksi internet stabil\n• Coba refresh halaman';
      } else if (err.message && (err.message.includes('JSON') || err.message.includes('Unexpected token'))) {
        errorMessage = '❌ Server mengembalikan respons yang tidak valid.\n\nCoba:\n• Refresh halaman\n• Cek console untuk detail error';
      } else if (err.message) {
        errorMessage = `❌ Error: ${err.message}`;
      }
      
      if (statusText) {
        statusText.textContent = errorMessage;
        statusText.style.color = '#ef4444';
        statusText.style.whiteSpace = 'pre-line';
        statusText.style.lineHeight = '1.6';
      }
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });

  return true;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready
  init();
}




