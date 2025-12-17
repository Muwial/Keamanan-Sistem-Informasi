CREATE TABLE IF NOT EXISTS letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Document type: 'surat' or 'sertifikat'
  document_type TEXT DEFAULT 'surat',
  -- Surat fields
  nomor_surat TEXT UNIQUE COLLATE NOCASE,
  perihal TEXT,
  penandatangan TEXT,
  jabatan_surat TEXT,
  tanggal_surat TEXT,
  -- Sertifikat fields
  nama_peserta TEXT,
  nomor_sertifikat TEXT UNIQUE COLLATE NOCASE,
  nama_penandatangan TEXT,
  jabatan_penandatangan TEXT,
  waktu_penandatangan TEXT,
  nama_instansi TEXT,
  nama_kegiatan TEXT,
  tanggal_pelaksanaan TEXT,
  -- Common fields
  file_path TEXT,
  tanda_tangan_path TEXT,
  nonce TEXT NOT NULL,
  data_hash TEXT NOT NULL,
  signature_hash TEXT,
  created_at TEXT NOT NULL
);




