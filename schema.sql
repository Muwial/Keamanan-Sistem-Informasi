CREATE TABLE IF NOT EXISTS letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_surat TEXT NOT NULL UNIQUE COLLATE NOCASE,
  perihal TEXT NOT NULL,
  penandatangan TEXT NOT NULL,
  tanggal_surat TEXT NOT NULL,
  file_path TEXT,
  tanda_tangan_path TEXT,
  nonce TEXT NOT NULL,
  data_hash TEXT NOT NULL,
  signature_hash TEXT,
  created_at TEXT NOT NULL
);




