const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { randomUUID } = require('crypto');
const Media   = require('../models/Media');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadToDrive, deleteFromDrive, isConfigured, getOAuthClient, DEFAULT_REDIRECT } = require('../utils/googleDrive');

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
    cb(null, `${randomUUID()}${ext}`);
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
// Hybrid storage: always saved locally + served from /uploads. Each file is also
// pushed to Google Drive as a best-effort backup when Drive is configured.
router.post('/', protect, adminOnly, upload.array('files', 20), async (req, res) => {
  try {
    const saved = await Promise.all(
      req.files.map(async f => {
        const filePath = path.join(__dirname, '..', 'uploads', f.filename);
        const drive = await uploadToDrive({
          filePath,
          filename: f.originalname,
          mimetype: f.mimetype,
        });
        return Media.create({
          originalName: f.originalname,
          filename:     f.filename,
          mimetype:     f.mimetype,
          size:         f.size,
          url:          `/uploads/${f.filename}`,
          driveFileId:  drive?.id   || '',
          driveLink:    drive?.link || '',
          uploadedBy:   req.user._id,
        });
      })
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
    // Remove the Drive backup too (best-effort)
    if (file.driveFileId) deleteFromDrive(file.driveFileId);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ─── Google Drive setup helpers ──────────────────────────────
 * One-time browser flow to obtain a refresh token. Public because Google
 * redirects the browser here without app auth headers; the flow is itself
 * gated by your Google login. After you paste the refresh token into .env
 * (and restart), these are no longer needed. */

// GET /api/upload/google/status — is Drive backup configured?
router.get('/google/status', protect, adminOnly, (req, res) => {
  res.json({ configured: isConfigured() });
});

// GET /api/upload/google/auth — start consent; redirects to Google
router.get('/google/auth', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).send('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.');
  }
  const oauth2 = getOAuthClient(false);
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',                       // force a refresh_token every time
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
  res.redirect(url);
});

// GET /api/upload/google/callback — exchange code, show refresh token to copy
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing authorization code.');
  try {
    const oauth2 = getOAuthClient(false);
    const { tokens } = await oauth2.getToken(code);
    const rt = tokens.refresh_token;
    if (!rt) {
      return res.send('<h3>No refresh token returned.</h3><p>Revoke access at <a href="https://myaccount.google.com/permissions">Google permissions</a> and try /api/upload/google/auth again.</p>');
    }
    res.send(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;max-width:680px;margin:3rem auto;line-height:1.6">
      <h2>✅ Google Drive connected</h2>
      <p>Add this line to <code>backend/.env</code>, then restart the server:</p>
      <pre style="background:#0f172a;color:#e2e8f0;padding:1rem;border-radius:8px;white-space:pre-wrap;word-break:break-all">GOOGLE_REFRESH_TOKEN=${rt}</pre>
      <p style="color:#64748b">You can close this tab afterwards.</p>
    </body>`);
  } catch (e) {
    res.status(500).send('Token exchange failed: ' + e.message);
  }
});

module.exports = router;
