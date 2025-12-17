const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const multer = require('multer');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult, query } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
// Disable helmet completely for development to avoid HTTPS enforcement
// app.use(helmet());
app.use(cors());

const uploadsDir = path.join(__dirname, 'uploads');
const qrDir = path.join(__dirname, 'qrcodes');
const signaturesDir = path.join(__dirname, 'signatures');

// Ensure all required directories exist
const ensureDirectoryExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Directory created: ${dirPath}`);
    }
    // Verify directory is writable
    fs.accessSync(dirPath, fs.constants.W_OK);
  } catch (err) {
    console.error(`Error ensuring directory exists: ${dirPath}`, err);
    throw new Error(`Cannot create or access directory: ${dirPath}. Error: ${err.message}`);
  }
};

ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(qrDir);
ensureDirectoryExists(signaturesDir);

// Storage for PDF files
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^\w.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// Storage for signature images (JPG/PNG)
const signatureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, signaturesDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^\w.-]/g, '_');
    const ext = path.extname(file.originalname);
    cb(null, `signature-${Date.now()}${ext}`);
  },
});

// Upload handler for PDF
const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Hanya file PDF yang diperbolehkan'));
    }
    cb(null, true);
  },
});

// Upload handler for signature images
const uploadSignature = multer({
  storage: signatureStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for signature
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Hanya file JPG atau PNG yang diperbolehkan untuk tanda tangan'));
    }
    cb(null, true);
  },
});

const sanitize = (value = '') =>
  String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();

// Generate SHA-256 hash for digital signature
// Hash dibuat dari data dokumen untuk memastikan integritas
const generateDataHash = (data) => {
  if (data.document_type === 'sertifikat') {
    // Hash for certificate
    const dataString = JSON.stringify({
      document_type: data.document_type,
      nama_peserta: data.nama_peserta,
      nomor_sertifikat: data.nomor_sertifikat,
      nama_penandatangan: data.nama_penandatangan,
      jabatan_penandatangan: data.jabatan_penandatangan,
      waktu_penandatangan: data.waktu_penandatangan,
      berlaku_hingga: data.berlaku_hingga || 'Selamanya',
      nama_instansi: data.nama_instansi,
      nama_kegiatan: data.nama_kegiatan,
      tanggal_pelaksanaan: data.tanggal_pelaksanaan,
    });
    return crypto.createHash('sha256').update(dataString).digest('hex');
  } else {
    // Hash for letter (backward compatible)
    const dataString = JSON.stringify({
      document_type: data.document_type || 'surat',
      nomor_surat: data.nomor_surat,
      perihal: data.perihal,
      penandatangan: data.penandatangan,
      jabatan_surat: data.jabatan_surat || '',
      tanggal_surat: data.tanggal_surat,
    });
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
};

// Generate hash for signature image if exists
const generateSignatureHash = async (signaturePath) => {
  if (!signaturePath) return null;
  try {
    // Use the signaturesDir constant instead of recreating path
    const filePath = path.join(signaturesDir, signaturePath);
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } else {
      console.warn(`Signature file not found: ${filePath}`);
    }
  } catch (err) {
    console.error('Error generating signature hash:', err);
  }
  return null;
};

// Verify data integrity
const verifyDataIntegrity = (row) => {
  if (!row.data_hash) return false;
  const documentType = row.document_type || 'surat';
  
  let currentData;
  if (documentType === 'sertifikat') {
    currentData = {
      document_type: documentType,
      nama_peserta: row.nama_peserta,
      nomor_sertifikat: row.nomor_sertifikat,
          nama_penandatangan: row.nama_penandatangan,
          jabatan_penandatangan: row.jabatan_penandatangan,
          waktu_penandatangan: row.waktu_penandatangan,
          berlaku_hingga: row.berlaku_hingga || 'Selamanya',
      nama_instansi: row.nama_instansi,
      nama_kegiatan: row.nama_kegiatan,
      tanggal_pelaksanaan: row.tanggal_pelaksanaan,
    };
  } else {
    currentData = {
      document_type: documentType,
      nomor_surat: row.nomor_surat,
      perihal: row.perihal,
      penandatangan: row.penandatangan,
      jabatan_surat: row.jabatan_surat || '',
      tanggal_surat: row.tanggal_surat,
    };
  }
  // Reconstruct hash (same format as when created)
  const dataString = JSON.stringify(currentData);
  const computedHash = crypto.createHash('sha256').update(dataString).digest('hex');
  return computedHash === row.data_hash;
};

const getLocalIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const getBaseUrl = (req) => {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  const host = req.headers.host || `${getLocalIp()}:${PORT}`;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return `http://${getLocalIp()}:${PORT}`;
  }
  return `${req.protocol}://${host}`;
};

app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/qrcodes', express.static(qrDir));
app.use('/signatures', express.static(signaturesDir));

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/verify', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'verify.html')));

const ensureQrExists = async (id, verificationUrl) => {
  // Always re-generate to ensure URL (IP/port) is up to date for mobile scans.
  try {
    // Ensure qrcodes directory exists before generating QR
    ensureDirectoryExists(qrDir);
    const filePath = path.join(qrDir, `qr-${id}.png`);
    const logoPath = path.join(__dirname, 'assets', 'Kelompok.png');
    
    // Generate QR code to buffer first
    const qrBuffer = await QRCode.toBuffer(verificationUrl, { 
      width: 400, 
      margin: 2,
      errorCorrectionLevel: 'H' // High error correction to allow logo overlay
    });
    
    // Check if logo exists
    if (fs.existsSync(logoPath)) {
      try {
        // Resize logo to approximately 20% of QR code size (80x80 for 400px QR)
        const logoSize = 80;
        const logoBuffer = await sharp(logoPath)
          .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .png()
          .toBuffer();
        
        // Calculate position to center logo
        const qrSize = 400;
        const logoPosition = {
          left: Math.floor((qrSize - logoSize) / 2),
          top: Math.floor((qrSize - logoSize) / 2)
        };
        
        // Composite logo onto QR code
        await sharp(qrBuffer)
          .composite([{
            input: logoBuffer,
            left: logoPosition.left,
            top: logoPosition.top
          }])
          .png()
          .toFile(filePath);
      } catch (logoErr) {
        console.warn(`Error adding logo to QR code for id ${id}, using QR without logo:`, logoErr.message);
        // Fallback to QR code without logo
        await QRCode.toFile(filePath, verificationUrl, { width: 400, margin: 2 });
      }
    } else {
      // Logo doesn't exist, generate QR code without logo
      console.warn(`Logo file not found at ${logoPath}, generating QR code without logo`);
      await QRCode.toFile(filePath, verificationUrl, { width: 400, margin: 2 });
    }
    
    return filePath;
  } catch (err) {
    console.error(`Error generating QR code for id ${id}:`, err);
    // Ensure directory exists and retry once
    ensureDirectoryExists(qrDir);
    const filePath = path.join(qrDir, `qr-${id}.png`);
    await QRCode.toFile(filePath, verificationUrl, { width: 400, margin: 2 });
    return filePath;
  }
};

// Combined upload handler for both PDF and signature
const uploadFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        if (file.fieldname === 'file') {
          // Ensure directory exists before multer tries to save
          ensureDirectoryExists(uploadsDir);
          cb(null, uploadsDir);
        } else if (file.fieldname === 'tanda_tangan') {
          // Ensure directory exists before multer tries to save
          ensureDirectoryExists(signaturesDir);
          cb(null, signaturesDir);
        } else {
          cb(new Error('Invalid field name'));
        }
      } catch (err) {
        console.error('Error in multer destination:', err);
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^\w.-]/g, '_');
      if (file.fieldname === 'tanda_tangan') {
        const ext = path.extname(file.originalname);
        cb(null, `signature-${Date.now()}${ext}`);
      } else {
        cb(null, `${Date.now()}-${safeName}`);
      }
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Hanya file PDF yang diperbolehkan untuk surat'));
      }
    } else if (file.fieldname === 'tanda_tangan') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Hanya file JPG atau PNG yang diperbolehkan untuk tanda tangan'));
      }
    }
    cb(null, true);
  },
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'tanda_tangan', maxCount: 1 },
]);

app.post(
  '/api/letters',
  uploadFiles,
  [
    body('document_type').trim().isIn(['surat', 'sertifikat']).withMessage('Format dokumen harus surat atau sertifikat'),
  ],
  async (req, res) => {
    // Ensure all directories exist before processing
    ensureDirectoryExists(uploadsDir);
    ensureDirectoryExists(qrDir);
    ensureDirectoryExists(signaturesDir);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const documentType = sanitize(req.body.document_type);
    const filePath = req.files?.file?.[0] ? req.files.file[0].filename : null;
    const tandaTanganPath = req.files?.tanda_tangan?.[0] ? req.files.tanda_tangan[0].filename : null;
    const nonce = uuidv4();

    try {
      // Validate document type specific fields
      if (documentType === 'surat') {
        const nomorSurat = sanitize(req.body.nomor_surat);
        const perihal = sanitize(req.body.perihal);
        const penandatangan = sanitize(req.body.penandatangan_surat);
        const jabatanSurat = sanitize(req.body.jabatan_surat);
        const tanggalSurat = sanitize(req.body.tanggal_surat);
        
        if (!nomorSurat || !perihal || !penandatangan || !jabatanSurat || !tanggalSurat) {
          return res.status(400).json({ 
            message: 'Data surat tidak lengkap. Harap lengkapi semua field yang wajib diisi.' 
          });
        }
        
        // Check existing with case-insensitive comparison for surat
        const existing = await db.get(
          'SELECT id, nomor_surat FROM letters WHERE LOWER(TRIM(nomor_surat)) = LOWER(TRIM(?)) AND document_type = ?',
          [nomorSurat, 'surat']
        );
        if (existing) {
          const existingData = await db.get(
            'SELECT id, nomor_surat, perihal, penandatangan, tanggal_surat, created_at FROM letters WHERE id = ?',
            [existing.id]
          );
          return res.status(409).json({ 
            message: `Nomor surat "${existing.nomor_surat}" sudah terdaftar`,
            existing_data: existingData,
            suggestion: 'Gunakan nomor surat yang berbeda atau hapus data lama dari dashboard admin'
          });
        }
      } else if (documentType === 'sertifikat') {
        const namaPeserta = sanitize(req.body.nama_peserta);
        const nomorSertifikat = sanitize(req.body.nomor_sertifikat);
        const namaPenandatangan = sanitize(req.body.nama_penandatangan_sertifikat);
        const jabatanPenandatangan = sanitize(req.body.jabatan_penandatangan);
        const waktuPenandatangan = sanitize(req.body.waktu_penandatangan);
        const berlakuSelamanya = req.body.berlaku_selamanya === 'true';
        const berlakuHinggaRaw = sanitize(req.body.berlaku_hingga);
        const berlakuHingga = berlakuSelamanya ? 'Selamanya' : (berlakuHinggaRaw || 'Selamanya');
        const namaInstansi = sanitize(req.body.nama_instansi);
        const namaKegiatan = sanitize(req.body.nama_kegiatan);
        const tanggalPelaksanaan = sanitize(req.body.tanggal_pelaksanaan);
        
        if (!namaPeserta || !nomorSertifikat || !namaPenandatangan || !jabatanPenandatangan || 
            !waktuPenandatangan || !namaInstansi || !namaKegiatan || !tanggalPelaksanaan) {
          return res.status(400).json({ 
            message: 'Data sertifikat tidak lengkap. Harap lengkapi semua field yang wajib diisi.' 
          });
        }
        
        // Check existing certificate number
        const existing = await db.get(
          'SELECT id, nomor_sertifikat FROM letters WHERE LOWER(TRIM(nomor_sertifikat)) = LOWER(TRIM(?)) AND document_type = ?',
          [nomorSertifikat, 'sertifikat']
        );
        if (existing) {
          return res.status(409).json({ 
            message: `Nomor sertifikat "${nomorSertifikat}" sudah terdaftar`,
            suggestion: 'Gunakan nomor sertifikat yang berbeda atau hapus data lama dari dashboard admin'
          });
        }
      }

      // Verify uploaded files actually exist
      if (filePath) {
        const uploadedFile = path.join(uploadsDir, filePath);
        if (!fs.existsSync(uploadedFile)) {
          console.error(`Uploaded file not found: ${uploadedFile}`);
          throw new Error(`File upload gagal: file tidak ditemukan di ${uploadsDir}`);
        }
      }
      if (tandaTanganPath) {
        const uploadedSignature = path.join(signaturesDir, tandaTanganPath);
        if (!fs.existsSync(uploadedSignature)) {
          console.warn(`Uploaded signature not found: ${uploadedSignature}`);
          // Don't throw error for signature, it's optional
        }
      }

      // Prepare data for hash generation and insertion
      let dataForHash, insertParams, insertSQL;
      
      if (documentType === 'surat') {
        const nomorSurat = sanitize(req.body.nomor_surat);
        const perihal = sanitize(req.body.perihal);
        const penandatangan = sanitize(req.body.penandatangan_surat);
        const jabatanSurat = sanitize(req.body.jabatan_surat);
        const tanggalSurat = sanitize(req.body.tanggal_surat);
        
        dataForHash = {
          document_type: documentType,
          nomor_surat: nomorSurat,
          perihal: perihal,
          penandatangan: penandatangan,
          jabatan_surat: jabatanSurat,
          tanggal_surat: tanggalSurat,
        };
        
        insertSQL = `INSERT INTO letters 
          (document_type, nomor_surat, perihal, penandatangan, jabatan_surat, tanggal_surat, file_path, tanda_tangan_path, nonce, data_hash, signature_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
        insertParams = [documentType, nomorSurat, perihal, penandatangan, jabatanSurat, tanggalSurat, filePath, tandaTanganPath, nonce];
      } else {
        const namaPeserta = sanitize(req.body.nama_peserta);
        const nomorSertifikat = sanitize(req.body.nomor_sertifikat);
        const namaPenandatangan = sanitize(req.body.nama_penandatangan_sertifikat);
        const jabatanPenandatangan = sanitize(req.body.jabatan_penandatangan);
        const waktuPenandatangan = sanitize(req.body.waktu_penandatangan);
        const berlakuSelamanya = req.body.berlaku_selamanya === 'true';
        const berlakuHinggaRaw = sanitize(req.body.berlaku_hingga);
        const berlakuHingga = berlakuSelamanya ? 'Selamanya' : (berlakuHinggaRaw || 'Selamanya');
        const namaInstansi = sanitize(req.body.nama_instansi);
        const namaKegiatan = sanitize(req.body.nama_kegiatan);
        const tanggalPelaksanaan = sanitize(req.body.tanggal_pelaksanaan);
        
        dataForHash = {
          document_type: documentType,
          nama_peserta: namaPeserta,
          nomor_sertifikat: nomorSertifikat,
          nama_penandatangan: namaPenandatangan,
          jabatan_penandatangan: jabatanPenandatangan,
          waktu_penandatangan: waktuPenandatangan,
          berlaku_hingga: berlakuHingga,
          nama_instansi: namaInstansi,
          nama_kegiatan: namaKegiatan,
          tanggal_pelaksanaan: tanggalPelaksanaan,
        };
        
        insertSQL = `INSERT INTO letters 
          (document_type, nama_peserta, nomor_sertifikat, nama_penandatangan, jabatan_penandatangan, waktu_penandatangan, berlaku_hingga, nama_instansi, nama_kegiatan, tanggal_pelaksanaan, file_path, tanda_tangan_path, nonce, data_hash, signature_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
        insertParams = [documentType, namaPeserta, nomorSertifikat, namaPenandatangan, jabatanPenandatangan, waktuPenandatangan, berlakuHingga, namaInstansi, namaKegiatan, tanggalPelaksanaan, filePath, tandaTanganPath, nonce];
      }

      // Generate digital signature hash
      const dataHash = generateDataHash(dataForHash);

      // Generate signature image hash if exists
      const signatureHash = await generateSignatureHash(tandaTanganPath);
      
      // Add hash values to insert params
      insertParams.push(dataHash, signatureHash);

      const result = await db.run(insertSQL, insertParams);

      const id = result.lastID;
      const verificationUrl = `${getBaseUrl(req)}/verify?id=${id}&nonce=${nonce}`;
      await ensureQrExists(id, verificationUrl);

      // Get the saved row to return hash
      const savedRow = await db.get('SELECT data_hash, signature_hash FROM letters WHERE id = ?', [id]);

      const docTypeLabel = documentType === 'sertifikat' ? 'Sertifikat' : 'Surat';
      return res.status(201).json({
        id,
        verificationUrl,
        data_hash: savedRow.data_hash,
        signature_hash: savedRow.signature_hash,
        message: `${docTypeLabel} berhasil disimpan`,
      });
    } catch (err) {
      console.error('Error saving letter:', err);
      
      // More specific error messages
      let errorMessage = 'Gagal menyimpan surat';
      if (err.message.includes('UNIQUE constraint')) {
        errorMessage = 'Nomor surat sudah terdaftar';
      } else if (err.message.includes('SQLITE')) {
        errorMessage = 'Kesalahan database. Pastikan database dapat diakses.';
      } else if (err.message.includes('ENOENT') || err.message.includes('no such file')) {
        errorMessage = 'Kesalahan akses file. Folder uploads, qrcodes, atau signatures tidak ditemukan. Pastikan folder-folder tersebut ada dan dapat diakses.';
        // Try to create missing directories
        ensureDirectoryExists(uploadsDir);
        ensureDirectoryExists(qrDir);
        ensureDirectoryExists(signaturesDir);
      }
      
      return res.status(500).json({ 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

app.get('/api/letters', async (req, res) => {
  try {
    // Check if this is a check request (for surat only, used by frontend)
    if (req.query.check) {
      const nomorSurat = req.query.check.trim();
      const existing = await db.get(
        'SELECT id, nomor_surat FROM letters WHERE LOWER(TRIM(nomor_surat)) = LOWER(TRIM(?)) AND (document_type IS NULL OR document_type = ?)',
        [nomorSurat, 'surat']
      );
      return res.json({ exists: !!existing, id: existing?.id || null });
    }
    
    // Ensure all directories exist before processing
    ensureDirectoryExists(uploadsDir);
    ensureDirectoryExists(qrDir);
    ensureDirectoryExists(signaturesDir);
    
    const rows = await db.all('SELECT * FROM letters ORDER BY created_at DESC');
    const data = [];
    // ensure QR exists for each record and generate hash for old data
    /* eslint-disable no-await-in-loop */
    for (const row of rows) {
      try {
        // Generate hash for old data that doesn't have hash
        if (!row.data_hash) {
          const documentType = row.document_type || 'surat';
          let dataForHash;
          if (documentType === 'sertifikat') {
            dataForHash = {
              document_type: documentType,
              nama_peserta: row.nama_peserta,
              nomor_sertifikat: row.nomor_sertifikat,
              nama_penandatangan: row.nama_penandatangan,
              jabatan_penandatangan: row.jabatan_penandatangan,
              waktu_penandatangan: row.waktu_penandatangan,
              berlaku_hingga: row.berlaku_hingga || '',
              nama_instansi: row.nama_instansi,
              nama_kegiatan: row.nama_kegiatan,
              tanggal_pelaksanaan: row.tanggal_pelaksanaan,
            };
          } else {
            dataForHash = {
              document_type: documentType,
              nomor_surat: row.nomor_surat,
              perihal: row.perihal,
              penandatangan: row.penandatangan,
              jabatan_surat: row.jabatan_surat || '',
              tanggal_surat: row.tanggal_surat,
            };
          }
          const dataHash = generateDataHash(dataForHash);
          let signatureHash = row.signature_hash;
          if (!signatureHash && row.tanda_tangan_path) {
            signatureHash = await generateSignatureHash(row.tanda_tangan_path);
          }
          // Update database with generated hash
          await db.run(
            'UPDATE letters SET data_hash = ?, signature_hash = ? WHERE id = ?',
            [dataHash, signatureHash, row.id]
          );
          row.data_hash = dataHash;
          row.signature_hash = signatureHash;
        }
        
        const verificationUrl = `${getBaseUrl(req)}/verify?id=${row.id}&nonce=${row.nonce}`;
        await ensureQrExists(row.id, verificationUrl);
        
        // Check if file actually exists before providing download URL
        let downloadUrl = null;
        if (row.file_path) {
          const fileLocation = path.join(uploadsDir, row.file_path);
          if (fs.existsSync(fileLocation)) {
            downloadUrl = `/download/${row.id}`;
          } else {
            console.warn(`File not found for record ${row.id}: ${fileLocation}`);
          }
        }
        
        // Check if signature file actually exists
        let tandaTanganUrl = null;
        if (row.tanda_tangan_path) {
          const signatureLocation = path.join(signaturesDir, row.tanda_tangan_path);
          if (fs.existsSync(signatureLocation)) {
            tandaTanganUrl = `/signatures/${row.tanda_tangan_path}`;
          } else {
            console.warn(`Signature file not found for record ${row.id}: ${signatureLocation}`);
          }
        }
        
        data.push({
          ...row,
          qr_image: `/qrcodes/qr-${row.id}.png`,
          download_url: downloadUrl,
          tanda_tangan_url: tandaTanganUrl,
          verification_url: verificationUrl,
          data_hash: row.data_hash || '',
          signature_hash: row.signature_hash || null,
        });
      } catch (rowErr) {
        // Log error but continue processing other rows
        console.error(`Error processing row ${row.id}:`, rowErr);
        // Still add the row but with limited data
        data.push({
          ...row,
          qr_image: `/qrcodes/qr-${row.id}.png`,
          download_url: null,
          tanda_tangan_url: null,
          verification_url: `${getBaseUrl(req)}/verify?id=${row.id}&nonce=${row.nonce}`,
          data_hash: row.data_hash || '',
          signature_hash: row.signature_hash || null,
          error: 'Error processing this record',
        });
      }
    }
    /* eslint-enable no-await-in-loop */
    res.json(data);
  } catch (err) {
    console.error('Error in /api/letters GET:', err);
    res.status(500).json({ 
      message: 'Gagal mengambil data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get(
  '/api/verify',
  [
    query('id').isInt({ gt: 0 }).withMessage('ID tidak valid'),
    query('nonce').isUUID().withMessage('Nonce tidak valid'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'INVALID', message: 'Permintaan tidak valid' });
    }
    const { id, nonce } = req.query;
    try {
      const row = await db.get('SELECT * FROM letters WHERE id = ? AND nonce = ?', [id, nonce]);
      if (!row) {
        return res.status(404).json({ status: 'INVALID', message: 'Surat tidak ditemukan' });
      }
      const verificationUrl = `${getBaseUrl(req)}/verify?id=${row.id}&nonce=${row.nonce}`;
      await ensureQrExists(row.id, verificationUrl);
      
      // Verify data integrity
      const isDataValid = verifyDataIntegrity(row);
      
      const documentType = row.document_type || 'surat';
      
      let data;
      if (documentType === 'sertifikat') {
        data = {
          document_type: documentType,
          nama_peserta: row.nama_peserta,
          nomor_sertifikat: row.nomor_sertifikat,
          nama_penandatangan: row.nama_penandatangan,
          jabatan_penandatangan: row.jabatan_penandatangan,
          waktu_penandatangan: row.waktu_penandatangan,
          berlaku_hingga: row.berlaku_hingga || 'Selamanya',
          nama_instansi: row.nama_instansi,
          nama_kegiatan: row.nama_kegiatan,
          tanggal_pelaksanaan: row.tanggal_pelaksanaan,
          download_url: row.file_path ? `/download/${row.id}` : null,
          tanda_tangan_url: row.tanda_tangan_path ? `/signatures/${row.tanda_tangan_path}` : null,
          data_hash: row.data_hash,
          signature_hash: row.signature_hash,
          integrity_verified: isDataValid,
          created_at: row.created_at,
        };
      } else {
        data = {
          document_type: documentType,
          nomor_surat: row.nomor_surat,
          perihal: row.perihal,
          penandatangan: row.penandatangan,
          jabatan_surat: row.jabatan_surat,
          tanggal_surat: row.tanggal_surat,
          download_url: row.file_path ? `/download/${row.id}` : null,
          tanda_tangan_url: row.tanda_tangan_path ? `/signatures/${row.tanda_tangan_path}` : null,
          data_hash: row.data_hash,
          signature_hash: row.signature_hash,
          integrity_verified: isDataValid,
          created_at: row.created_at,
        };
      }
      
      return res.json({
        status: 'VERIFIED',
        data: data,
      });
    } catch (err) {
      console.error('Error in /api/verify:', err);
      return res.status(500).json({ 
        status: 'ERROR', 
        message: 'Terjadi kesalahan saat memverifikasi surat',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

app.get('/download/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const row = await db.get('SELECT file_path FROM letters WHERE id = ?', [id]);
    if (!row || !row.file_path) {
      return res.status(404).send('File tidak ditemukan');
    }
    
    // Ensure uploads directory exists
    ensureDirectoryExists(uploadsDir);
    
    const fileLocation = path.join(uploadsDir, row.file_path);
    if (!fs.existsSync(fileLocation)) {
      console.warn(`File not found: ${fileLocation}`);
      return res.status(404).send('File tidak ditemukan di server');
    }
    
    res.download(fileLocation, row.file_path);
  } catch (err) {
    console.error('Error downloading file:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Gagal mengunduh file',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
});

app.get('/api/export/excel', async (req, res) => {
  try {
    // Ensure all directories exist before processing
    ensureDirectoryExists(uploadsDir);
    ensureDirectoryExists(qrDir);
    ensureDirectoryExists(signaturesDir);
    
    const rows = await db.all('SELECT * FROM letters ORDER BY created_at DESC');
    const workbook = new ExcelJS.Workbook();
    
    // Create separate sheets for Surat and Sertifikat
    const suratSheet = workbook.addWorksheet('Data Surat');
    const sertifikatSheet = workbook.addWorksheet('Data Sertifikat');
    
    // Columns for Surat
    suratSheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nomor Surat', key: 'nomor_surat', width: 25 },
      { header: 'Perihal', key: 'perihal', width: 30 },
      { header: 'Nama Penandatangan', key: 'penandatangan', width: 25 },
      { header: 'Jabatan Penandatangan', key: 'jabatan_surat', width: 30 },
      { header: 'Tanggal Surat', key: 'tanggal_surat', width: 18 },
      { header: 'Data Hash (SHA-256)', key: 'data_hash', width: 70 },
      { header: 'Signature Hash (SHA-256)', key: 'signature_hash', width: 70 },
      { header: 'QR Code', key: 'qr', width: 15 },
    ];
    
    // Columns for Sertifikat
    sertifikatSheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Peserta', key: 'nama_peserta', width: 30 },
      { header: 'Nomor Sertifikat', key: 'nomor_sertifikat', width: 25 },
      { header: 'Nama Penandatangan', key: 'nama_penandatangan', width: 25 },
      { header: 'Jabatan Penandatangan', key: 'jabatan_penandatangan', width: 30 },
      { header: 'Tanggal Penandatanganan', key: 'waktu_penandatangan', width: 22 },
      { header: 'Berlaku Hingga', key: 'berlaku_hingga', width: 20 },
      { header: 'Nama Instansi/Organisasi', key: 'nama_instansi', width: 30 },
      { header: 'Nama Kegiatan/Pelatihan', key: 'nama_kegiatan', width: 35 },
      { header: 'Tanggal Pelaksanaan', key: 'tanggal_pelaksanaan', width: 20 },
      { header: 'Data Hash (SHA-256)', key: 'data_hash', width: 70 },
      { header: 'Signature Hash (SHA-256)', key: 'signature_hash', width: 70 },
      { header: 'QR Code', key: 'qr', width: 15 },
    ];

    let suratRowIndex = 2;
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      
      try {
        // Generate hash for old data that doesn't have hash
        let dataHash = row.data_hash;
        let signatureHash = row.signature_hash;
        
        if (!dataHash) {
          const documentType = row.document_type || 'surat';
          let dataForHash;
          if (documentType === 'sertifikat') {
            dataForHash = {
              document_type: documentType,
              nama_peserta: row.nama_peserta,
              nomor_sertifikat: row.nomor_sertifikat,
              nama_penandatangan: row.nama_penandatangan,
              jabatan_penandatangan: row.jabatan_penandatangan,
              waktu_penandatangan: row.waktu_penandatangan,
              berlaku_hingga: row.berlaku_hingga || '',
              nama_instansi: row.nama_instansi,
              nama_kegiatan: row.nama_kegiatan,
              tanggal_pelaksanaan: row.tanggal_pelaksanaan,
            };
          } else {
            dataForHash = {
              document_type: documentType,
              nomor_surat: row.nomor_surat,
              perihal: row.perihal,
              penandatangan: row.penandatangan,
              jabatan_surat: row.jabatan_surat || '',
              tanggal_surat: row.tanggal_surat,
            };
          }
          dataHash = generateDataHash(dataForHash);
          // Update database
          await db.run('UPDATE letters SET data_hash = ? WHERE id = ?', [dataHash, row.id]);
        }
        
        if (!signatureHash && row.tanda_tangan_path) {
          signatureHash = await generateSignatureHash(row.tanda_tangan_path);
          if (signatureHash) {
            await db.run('UPDATE letters SET signature_hash = ? WHERE id = ?', [signatureHash, row.id]);
          }
        }
        
        const verificationUrl = `${getBaseUrl(req)}/verify?id=${row.id}&nonce=${row.nonce}`;
        const qrPath = await ensureQrExists(row.id, verificationUrl);
        
        const documentType = row.document_type || 'surat';
        
        if (documentType === 'sertifikat') {
          // Add to sertifikat sheet
          const sertifikatRowIndex = sertifikatSheet.rowCount + 1;
          sertifikatSheet.addRow({
            no: sertifikatRowIndex - 1, // -1 karena row pertama adalah header
            nama_peserta: row.nama_peserta || 'N/A',
            nomor_sertifikat: row.nomor_sertifikat || 'N/A',
            nama_penandatangan: row.nama_penandatangan || 'N/A',
            jabatan_penandatangan: row.jabatan_penandatangan || 'N/A',
              waktu_penandatangan: row.waktu_penandatangan || 'N/A',
              berlaku_hingga: row.berlaku_hingga || 'Selamanya',
            nama_instansi: row.nama_instansi || 'N/A',
            nama_kegiatan: row.nama_kegiatan || 'N/A',
            tanggal_pelaksanaan: row.tanggal_pelaksanaan || 'N/A',
            data_hash: dataHash || 'N/A',
            signature_hash: signatureHash || 'N/A',
          });

          // Add QR image to sertifikat sheet
          if (fs.existsSync(qrPath)) {
            try {
              const imageId = workbook.addImage({
                filename: qrPath,
                extension: 'png',
              });
              sertifikatSheet.addImage(imageId, {
                tl: { col: 12, row: sertifikatRowIndex - 1 },
                ext: { width: 100, height: 100 },
              });
            } catch (imgErr) {
              console.warn(`Failed to add QR image for sertifikat row ${row.id}:`, imgErr.message);
            }
          }
        } else {
          // Add to surat sheet
          suratSheet.addRow({
            no: suratRowIndex - 1,
            nomor_surat: row.nomor_surat || 'N/A',
            perihal: row.perihal || 'N/A',
            penandatangan: row.penandatangan || 'N/A',
            jabatan_surat: row.jabatan_surat || 'N/A',
            tanggal_surat: row.tanggal_surat || 'N/A',
            data_hash: dataHash || 'N/A',
            signature_hash: signatureHash || 'N/A',
          });

          // Add QR image to surat sheet
          if (fs.existsSync(qrPath)) {
            try {
              const imageId = workbook.addImage({
                filename: qrPath,
                extension: 'png',
              });
              suratSheet.addImage(imageId, {
                tl: { col: 8, row: suratRowIndex - 1 },
                ext: { width: 100, height: 100 },
              });
            } catch (imgErr) {
              console.warn(`Failed to add QR image for surat row ${row.id}:`, imgErr.message);
            }
          }
          suratRowIndex += 1;
        }
      } catch (rowErr) {
        // Log error but continue processing other rows
        console.error(`Error processing row ${row.id} for export:`, rowErr);
        const documentType = row.document_type || 'surat';
        
        // Still add the row with available data
        if (documentType === 'sertifikat') {
          const sertifikatRowIndex = sertifikatSheet.rowCount + 1;
          sertifikatSheet.addRow({
            no: sertifikatRowIndex - 1, // -1 karena row pertama adalah header
            nama_peserta: row.nama_peserta || 'N/A',
            nomor_sertifikat: row.nomor_sertifikat || 'N/A',
            nama_penandatangan: row.nama_penandatangan || 'N/A',
            jabatan_penandatangan: row.jabatan_penandatangan || 'N/A',
            waktu_penandatangan: row.waktu_penandatangan || 'N/A',
            berlaku_hingga: row.berlaku_hingga || 'Selamanya',
            nama_instansi: row.nama_instansi || 'N/A',
            nama_kegiatan: row.nama_kegiatan || 'N/A',
            tanggal_pelaksanaan: row.tanggal_pelaksanaan || 'N/A',
            data_hash: row.data_hash || 'N/A',
            signature_hash: row.signature_hash || 'N/A',
          });
        } else {
          suratSheet.addRow({
            no: suratRowIndex - 1,
            nomor_surat: row.nomor_surat || 'N/A',
            perihal: row.perihal || 'N/A',
            penandatangan: row.penandatangan || 'N/A',
            jabatan_surat: row.jabatan_surat || 'N/A',
            tanggal_surat: row.tanggal_surat || 'N/A',
            data_hash: row.data_hash || 'N/A',
            signature_hash: row.signature_hash || 'N/A',
          });
          suratRowIndex += 1;
        }
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=\"data-digital-signature.xlsx\"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exporting Excel:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Gagal export Excel',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    console.error(err);
    res.status(500).json({ message: 'Gagal mengekspor data' });
  }
});

app.delete(
  '/api/letters/:id',
  [query('force').optional().isIn(['1', 'true']), query('nonce').optional().isUUID()],
  async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Permintaan tidak valid' });
    }
    try {
      const row = await db.get('SELECT * FROM letters WHERE id = ?', [id]);
      if (!row) return res.status(404).json({ message: 'Data tidak ditemukan' });

      // Hapus file surat jika ada
      if (row.file_path) {
        try {
          const fileLocation = path.join(uploadsDir, row.file_path);
          if (fs.existsSync(fileLocation)) {
            fs.unlinkSync(fileLocation);
          }
        } catch (err) {
          console.warn(`Failed to delete file: ${row.file_path}`, err.message);
        }
      }
      // Hapus file tanda tangan jika ada
      if (row.tanda_tangan_path) {
        try {
          const signatureLocation = path.join(signaturesDir, row.tanda_tangan_path);
          if (fs.existsSync(signatureLocation)) {
            fs.unlinkSync(signatureLocation);
          }
        } catch (err) {
          console.warn(`Failed to delete signature: ${row.tanda_tangan_path}`, err.message);
        }
      }
      // Hapus QR code terkait
      try {
        const qrPath = path.join(qrDir, `qr-${row.id}.png`);
        if (fs.existsSync(qrPath)) {
          fs.unlinkSync(qrPath);
        }
      } catch (err) {
        console.warn(`Failed to delete QR code for id ${row.id}`, err.message);
      }

      await db.run('DELETE FROM letters WHERE id = ?', [id]);
      return res.json({ message: 'Data berhasil dihapus' });
    } catch (err) {
      console.error('Error deleting letter:', err);
      return res.status(500).json({ 
        message: 'Gagal menghapus data',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    // Ensure directories exist in case of multer error
    ensureDirectoryExists(uploadsDir);
    ensureDirectoryExists(signaturesDir);
    return res.status(400).json({ 
      message: err.message || 'Error uploading file',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  if (err.message) {
    console.error('Request error:', err);
    return res.status(400).json({ 
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  console.error('Unexpected error:', err);
  return res.status(500).json({ 
    message: 'Terjadi kesalahan',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`QR Codes directory: ${qrDir}`);
  console.log(`Signatures directory: ${signaturesDir}`);
  console.log(`All required directories are ready.`);
  
  // Verify directories exist and are writable
  try {
    [uploadsDir, qrDir, signaturesDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.accessSync(dir, fs.constants.W_OK);
        console.log(`✓ ${dir} exists and is writable`);
      } else {
        console.error(`✗ ${dir} does not exist!`);
      }
    });
  } catch (err) {
    console.error('Error verifying directories:', err);
  }
});

