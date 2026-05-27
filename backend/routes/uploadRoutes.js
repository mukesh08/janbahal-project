const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');
const Media   = require('../models/Media');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|svg|webp|pdf|mp4|webm/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype.split('/')[1]);
    ok ? cb(null, true) : cb(new Error('File type not allowed'));
  },
});

// GET all media  (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const files = await Media.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST upload  (admin, multiple files)
router.post('/', protect, adminOnly, upload.array('files', 20), async (req, res) => {
  try {
    const saved = await Promise.all(
      req.files.map(f =>
        Media.create({
          originalName: f.originalname,
          filename:     f.filename,
          mimetype:     f.mimetype,
          size:         f.size,
          url:          `/uploads/${f.filename}`,
          uploadedBy:   req.user._id,
        })
      )
    );
    res.status(201).json(saved);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE single file  (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const file = await Media.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ message: 'Not found' });
    // Remove from disk
    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
