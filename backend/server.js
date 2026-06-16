// Tiny .env loader — replaces dotenv package
const fs = require('fs'), path = require('path');
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // ISP DNS doesn't support SRV records needed by mongodb+srv://
const express  = require('express');
const mongoose = require('mongoose');

const authRoutes     = require('./routes/authRoutes');
const pageRoutes     = require('./routes/pageRoutes');
const menuRoutes     = require('./routes/menuRoutes');
const footerRoutes   = require('./routes/footerRoutes');
const uploadRoutes   = require('./routes/uploadRoutes');
const postRoutes     = require('./routes/postRoutes');
const headerRoutes   = require('./routes/headerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const sliderRoutes   = require('./routes/sliderRoutes');

const app = express();

// CORS — replaces cors package
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.json({ message: 'NewaCore API Running', status: 'ok' }));
app.use('/api/auth',     authRoutes);
app.use('/api/pages',    pageRoutes);
app.use('/api/menu',     menuRoutes);
app.use('/api/footer',   footerRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/header',   headerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/slides',   sliderRoutes);

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5001;
mongoose.connect(process.env.MONGODB_URI)
  .then(conn => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });
