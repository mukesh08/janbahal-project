require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');

const authRoutes   = require('./routes/authRoutes');
const pageRoutes   = require('./routes/pageRoutes');
const menuRoutes   = require('./routes/menuRoutes');
const footerRoutes = require('./routes/footerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => res.json({ message: 'Janbahal API Running', status: 'ok' }));
app.use('/api/auth',   authRoutes);
app.use('/api/pages',  pageRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/upload', uploadRoutes);

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
