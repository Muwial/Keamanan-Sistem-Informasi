// Wait for DOM to be ready
const init = () => {
const container = document.getElementById('verifyResult');

  if (!container) {
    console.error('Container element not found!');
    document.body.innerHTML = '<div style="padding:20px;">Error: Container element tidak ditemukan</div>';
    return;
  }

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const nonce = params.get('nonce');

  console.log('Verification page loaded. ID:', id, 'Nonce:', nonce);

const renderLoading = () => {
  container.classList.add('centered');
  container.innerHTML = `
    <div class="loading"></div>
    <p class="muted">Memuat data verifikasi...</p>
  `;
};

const renderSuccess = (data) => {
  container.classList.remove('centered');
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const documentType = data.document_type || 'surat';
    const docTypeLabel = documentType === 'sertifikat' ? 'Sertifikat' : 'Surat';
    const docTypeMessage = documentType === 'sertifikat' ? 'Sertifikat terverifikasi dan sah.' : 'Surat terverifikasi dan sah.';
    
    let infoGridHTML = '';
    if (documentType === 'sertifikat') {
      infoGridHTML = `
        <div class="info-grid" style="margin-top:16px;">
          <div class="info-item"><strong>Nama Peserta</strong><br>${escapeHtml(data.nama_peserta || '')}</div>
          <div class="info-item"><strong>Nomor Sertifikat</strong><br>${escapeHtml(data.nomor_sertifikat || '')}</div>
          <div class="info-item"><strong>Nama Penandatangan</strong><br>${escapeHtml(data.nama_penandatangan || '')}</div>
          <div class="info-item"><strong>Jabatan Penandatangan</strong><br>${escapeHtml(data.jabatan_penandatangan || '')}</div>
          <div class="info-item"><strong>Waktu Penandatangan</strong><br>${escapeHtml(data.waktu_penandatangan || '')}</div>
          <div class="info-item"><strong>Nama Instansi/Organisasi</strong><br>${escapeHtml(data.nama_instansi || '')}</div>
          <div class="info-item"><strong>Nama Kegiatan/Pelatihan</strong><br>${escapeHtml(data.nama_kegiatan || '')}</div>
          <div class="info-item"><strong>Tanggal Pelaksanaan</strong><br>${escapeHtml(data.tanggal_pelaksanaan || '')}</div>
        </div>
      `;
    } else {
      infoGridHTML = `
        <div class="info-grid" style="margin-top:16px;">
          <div class="info-item"><strong>Nomor Surat</strong><br>${escapeHtml(data.nomor_surat || '')}</div>
          <div class="info-item"><strong>Perihal</strong><br>${escapeHtml(data.perihal || '')}</div>
          <div class="info-item"><strong>Nama Penandatangan</strong><br>${escapeHtml(data.penandatangan || '')}</div>
          <div class="info-item"><strong>Jabatan Penandatangan</strong><br>${escapeHtml(data.jabatan_surat || '')}</div>
          <div class="info-item"><strong>Tanggal Surat</strong><br>${escapeHtml(data.tanggal_surat || '')}</div>
        </div>
      `;
    }
    
  container.innerHTML = `
    <div class="status success">VERIFIED</div>
    <p class="muted">${docTypeMessage}</p>
    ${infoGridHTML}
      <div style="margin-top:20px; display:flex; flex-direction:column; gap:16px;">
      ${
        data.download_url
            ? `<a class="btn-primary" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;" href="${escapeHtml(data.download_url)}">📄 Download ${docTypeLabel} PDF</a>`
            : ''
        }
        ${
          data.tanda_tangan_url
            ? `<div style="padding:16px; background:rgba(30, 41, 59, 0.5); border-radius:12px; border:2px solid #334155; text-align:center;">
                <strong style="display:block; margin-bottom:12px; color:#cbd5e1; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Tanda Tangan</strong>
                <img src="${escapeHtml(data.tanda_tangan_url)}" alt="Tanda Tangan" style="max-width:100%; max-height:150px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">
              </div>`
            : ''
        }
        ${
          data.integrity_verified !== undefined
            ? `<div style="padding:16px; background:${data.integrity_verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border-radius:12px; border:2px solid ${data.integrity_verified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                  <span style="font-size:20px;">${data.integrity_verified ? '✅' : '❌'}</span>
                  <strong style="color:${data.integrity_verified ? '#10b981' : '#ef4444'};">
                    ${data.integrity_verified ? 'Integritas Data Terverifikasi' : 'Integritas Data Tidak Valid'}
                  </strong>
                </div>
                <div style="margin-top:12px; padding-top:12px; border-top:1px solid ${data.integrity_verified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};">
                  <p style="font-size:11px; color:#94a3b8; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Data Hash (SHA-256):</p>
                  <code style="display:block; padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; font-size:11px; word-break:break-all; color:#cbd5e1;">${escapeHtml(data.data_hash || 'N/A')}</code>
                  ${
                    data.signature_hash
                      ? `<p style="font-size:11px; color:#94a3b8; margin:12px 0 8px 0; text-transform:uppercase; letter-spacing:0.5px;">Signature Hash (SHA-256):</p>
                         <code style="display:block; padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; font-size:11px; word-break:break-all; color:#cbd5e1;">${escapeHtml(data.signature_hash)}</code>`
                      : ''
                  }
                  ${
                    data.created_at
                      ? `<p style="font-size:11px; color:#94a3b8; margin:12px 0 4px 0; text-transform:uppercase; letter-spacing:0.5px;">Waktu Pembuatan:</p>
                         <p style="color:#cbd5e1; font-size:13px;">${escapeHtml(data.created_at)}</p>`
                      : ''
                  }
                </div>
              </div>`
            : ''
        }
        ${
          !data.download_url && !data.tanda_tangan_url
            ? `<div style="padding:16px; background:rgba(30, 41, 59, 0.5); border-radius:12px; text-align:center;"><span class="muted">Tidak ada file ${docTypeLabel.toLowerCase()} atau tanda tangan terlampir.</span></div>`
            : ''
      }
    </div>
  `;
};

const renderError = (message) => {
  container.classList.add('centered');
  container.innerHTML = `
    <div class="status danger">TIDAK VALID</div>
    <p style="margin:8px 0;">${message}</p>
    <p class="muted" style="max-width:320px;">
      Pastikan koneksi Anda berada di jaringan Wi-Fi yang sama dengan server
      dan QR Code terbaru dipakai (bukan hasil cache/foto lama).
    </p>
  `;
};

const fetchData = async () => {
  if (!id || !nonce) {
    renderError('Tautan verifikasi tidak lengkap.');
    return;
  }
  renderLoading();
  try {
      // Build URL - handle both absolute and relative paths
      let baseUrl = window.location.origin;
      // Fallback if origin is not available
      if (!baseUrl || baseUrl === 'null') {
        baseUrl = window.location.protocol + '//' + window.location.host;
      }
      const url = `${baseUrl}/api/verify?id=${encodeURIComponent(id)}&nonce=${encodeURIComponent(nonce)}`;
      console.log('Fetching verification data from:', url);
      console.log('Current location:', window.location.href);
      
      const res = await fetch(url, { 
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });
      
      console.log('Response status:', res.status, res.statusText);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        // Handle non-200 responses
        let errorMessage = 'Gagal memuat data verifikasi.';
        try {
          const errorData = await res.json();
          console.log('Error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
          const text = await res.text();
          console.error('Response text:', text);
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
        renderError(errorMessage);
        return;
      }
      
      let data;
      try {
        const text = await res.text();
        console.log('Response text:', text);
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        renderError('Format response tidak valid dari server.');
        return;
      }
      
      console.log('Response data:', data);
      
      if (data.status === 'VERIFIED' && data.data) {
      renderSuccess(data.data);
    } else {
      renderError(data.message || 'Data tidak ditemukan atau QR tidak valid.');
    }
  } catch (err) {
      console.error('Error fetching verification data:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      renderError('Gagal memuat data verifikasi. Pastikan server sedang berjalan dan koneksi internet stabil. Error: ' + err.message);
  }
};

fetchData();
};

// Run when DOM is ready
console.log('=== verify.js script loaded ===');
console.log('Document readyState:', document.readyState);
if (typeof window.verifyScriptLoaded === 'function') {
  window.verifyScriptLoaded();
}

if (document.readyState === 'loading') {
  console.log('Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired, calling init()');
    init();
  });
} else {
  // DOM already loaded
  console.log('DOM already loaded, calling init() immediately');
  // Small delay to ensure everything is ready
  setTimeout(function() {
    init();
  }, 100);
}

// Also try immediate execution as fallback
setTimeout(function() {
  const container = document.getElementById('verifyResult');
  if (container && container.innerHTML.includes('Memuat data verifikasi')) {
    console.warn('Script may not have executed, container still shows loading...');
    // Try to re-initialize
    if (typeof init === 'function') {
      console.log('Attempting to re-initialize...');
      init();
    }
  }
}, 2000);

