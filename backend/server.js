require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // ISP DNS doesn't support SRV records needed by mongodb+srv://
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');

const authRoutes   = require('./routes/authRoutes');
const pageRoutes   = require('./routes/pageRoutes');
const menuRoutes   = require('./routes/menuRoutes');
const footerRoutes = require('./routes/footerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const postRoutes   = require('./routes/postRoutes');
const headerRoutes   = require('./routes/headerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => res.json({ message: 'NewaCore API Running', status: 'ok' }));
app.use('/api/auth',   authRoutes);
app.use('/api/pages',  pageRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts',  postRoutes);
app.use('/api/header',   headerRoutes);
app.use('/api/settings', settingsRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// MongoDB + start
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

const PORT = process.env.PORT || 5001;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });
