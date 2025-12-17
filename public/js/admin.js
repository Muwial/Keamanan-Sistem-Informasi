const suratBody = document.querySelector('#suratTable tbody');
const sertifikatBody = document.querySelector('#sertifikatTable tbody');
const exportBtn = document.getElementById('exportBtn');

const deleteData = async (id) => {
  const confirmDelete = window.confirm('Hapus data ini beserta QR & file surat?');
  if (!confirmDelete) return;
  try {
    const res = await fetch(`/api/letters/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Gagal menghapus data');
      return;
    }
    await loadData();
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan saat menghapus data');
  }
};

const renderRows = (rows) => {
  // Pisahkan data berdasarkan tipe dokumen
  const suratRows = rows.filter(r => (r.document_type || 'surat') === 'surat');
  const sertifikatRows = rows.filter(r => r.document_type === 'sertifikat');

  suratBody.innerHTML = '';
  sertifikatBody.innerHTML = '';

  // Render tabel Surat
  suratRows.forEach((row, idx) => {
    const hashShort = row.data_hash ? row.data_hash.substring(0, 12) + '...' : 'N/A';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${row.nomor_surat || 'N/A'}</td>
      <td>${row.perihal || 'N/A'}</td>
      <td>${row.penandatangan || 'N/A'}</td>
      <td>${row.tanggal_surat || 'N/A'}</td>
      <td>
        <a href="${row.qr_image}" download="qr-code-${row.id}-${row.data_hash ? row.data_hash.substring(0, 8) : ''}.png" target="_blank">
          <img class="qr-thumb" src="${row.qr_image}" alt="qr">
        </a>
        <div style="margin-top:4px; font-size:10px; color:#94a3b8;">
          <code style="font-size:9px; word-break:break-all;">${hashShort}</code>
        </div>
      </td>
      <td class="table-actions">
        <a class="btn-ghost" href="${row.qr_image}" download="qr-code-${row.id}-${row.data_hash ? row.data_hash.substring(0, 8) : ''}.png">Download QR</a>
        <a class="btn-ghost" href="${row.verification_url}" target="_blank">Buka Verifikasi</a>
        ${row.download_url ? `<a class="btn-ghost" href="${row.download_url}">Download Surat</a>` : '<span class="muted">Tidak ada file</span>'}
        ${row.tanda_tangan_url ? `<a class="btn-ghost" href="${row.tanda_tangan_url}" target="_blank">Lihat Tanda Tangan</a>` : ''}
        <button class="btn-danger" data-id="${row.id}">Hapus</button>
      </td>
    `;
    suratBody.appendChild(tr);
  });

  // Render tabel Sertifikat
  sertifikatRows.forEach((row, idx) => {
    const hashShort = row.data_hash ? row.data_hash.substring(0, 12) + '...' : 'N/A';
    const berlakuHingga = row.berlaku_hingga || row.tanggal_pelaksanaan || 'Selamanya';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${row.nama_peserta || 'N/A'}</td>
      <td>${row.nomor_sertifikat || 'N/A'}</td>
      <td>${row.nama_penandatangan || 'N/A'}</td>
      <td>${berlakuHingga}</td>
      <td>
        <a href="${row.qr_image}" download="qr-code-${row.id}-${row.data_hash ? row.data_hash.substring(0, 8) : ''}.png" target="_blank">
          <img class="qr-thumb" src="${row.qr_image}" alt="qr">
        </a>
        <div style="margin-top:4px; font-size:10px; color:#94a3b8;">
          <code style="font-size:9px; word-break:break-all;">${hashShort}</code>
        </div>
      </td>
      <td class="table-actions">
        <a class="btn-ghost" href="${row.qr_image}" download="qr-code-${row.id}-${row.data_hash ? row.data_hash.substring(0, 8) : ''}.png">Download QR</a>
        <a class="btn-ghost" href="${row.verification_url}" target="_blank">Buka Verifikasi</a>
        ${row.download_url ? `<a class="btn-ghost" href="${row.download_url}">Download Sertifikat</a>` : '<span class="muted">Tidak ada file</span>'}
        ${row.tanda_tangan_url ? `<a class="btn-ghost" href="${row.tanda_tangan_url}" target="_blank">Lihat Tanda Tangan</a>` : ''}
        <button class="btn-danger" data-id="${row.id}">Hapus</button>
      </td>
    `;
    sertifikatBody.appendChild(tr);
  });
};

const loadData = async () => {
  suratBody.innerHTML = '<tr><td colspan="7" class="muted">Memuat...</td></tr>';
  sertifikatBody.innerHTML = '<tr><td colspan="7" class="muted">Memuat...</td></tr>';
  try {
    const res = await fetch('/api/letters');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Data loaded:', data.length, 'records');
    console.log('Data details:', data);
    
    if (data.length === 0) {
      const emptyHtml = '<tr><td colspan="7" class="muted" style="text-align:center; padding:40px;">Belum ada data dokumen. <a href="/" style="color:#3b82f6;">Input dokumen baru</a></td></tr>';
      suratBody.innerHTML = emptyHtml;
      sertifikatBody.innerHTML = emptyHtml;
    } else {
      renderRows(data);
      console.log('Table rendered with', data.length, 'rows');
      
      // Show count
      const countInfo = document.getElementById('dataCount');
      if (countInfo) {
        const suratCount = data.filter(r => (r.document_type || 'surat') === 'surat').length;
        const sertifikatCount = data.filter(r => r.document_type === 'sertifikat').length;
        countInfo.textContent = `Total: ${data.length} dokumen (${suratCount} surat, ${sertifikatCount} sertifikat)`;
      }
    }
  } catch (err) {
    console.error('Error loading data:', err);
    const errorHtml = `<tr><td colspan="7" class="muted" style="color:#ef4444; text-align:center; padding:20px;">
      Gagal memuat data.<br>
      <small>Error: ${err.message}</small><br>
      <button onclick="location.reload()" class="btn-primary" style="margin-top:10px;">Refresh Halaman</button>
    </td></tr>`;
    suratBody.innerHTML = errorHtml;
    sertifikatBody.innerHTML = errorHtml;
  }
};

exportBtn.addEventListener('click', () => {
  window.open('/api/export/excel', '_blank');
});

// Delegasi event hapus untuk kedua tabel
const handleDeleteClick = (e) => {
  const btn = e.target.closest('button.btn-danger');
  if (btn && btn.dataset.id) {
    deleteData(btn.dataset.id);
  }
};

suratBody.addEventListener('click', handleDeleteClick);
sertifikatBody.addEventListener('click', handleDeleteClick);

loadData();