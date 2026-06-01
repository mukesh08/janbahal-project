const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route  POST /api/auth/register
// @desc   Register a new admin user
// @access Public (disable after first user in production)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: 'admin' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/login
// @desc   Login and get token
// @access Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/auth/me
// @desc   Get logged-in user profile
// @access Private
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// @route  PUT /api/auth/account
// @desc   Update own profile (name, email, password)
// @access Private
router.put('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email, currentPassword, newPassword } = req.body;

    if (name)  user.name  = name;
    if (email) user.email = email;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required.' });
      const match = await user.matchPassword(currentPassword);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
      user.password = newPassword;
    }

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/auth/users
// @desc   List all users
// @access Private (admin)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/users
// @desc   Create a new user
// @access Private (admin)
router.post('/users', protect, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists.' });
    const user = await User.create({ name, email, password, role: role || 'admin' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/auth/users/:id
// @desc   Update a user
// @access Private (admin)
router.put('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { name, email, password, role } = req.body;
    if (name)     user.name  = name;
    if (email)    user.email = email;
    if (role)     user.role  = role;
    if (password) user.password = password;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  DELETE /api/auth/users/:id
// @desc   Delete a user
// @access Private (admin)
router.delete('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.deleteOne();
    res.json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/forgot-password
// @desc   Generate temp password and email it to the user
// @access Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email.' });

    // Generate a random 10-char temp password
    const tempPassword = Math.random().toString(36).slice(-5) + Math.random().toString(36).slice(-5).toUpperCase() + '!';

    user.password = tempPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Temporary Password - NewaCore',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:2rem;border:1px solid #e2e8f0;border-radius:10px">
          <h2 style="color:#4f46e5">NewaCore</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your temporary password is:</p>
          <div style="background:#f1f5f9;padding:1rem;border-radius:8px;font-size:1.4rem;font-weight:bold;letter-spacing:2px;text-align:center;color:#0f172a">
            ${tempPassword}
          </div>
          <p style="margin-top:1rem;color:#64748b;font-size:0.9rem">Please log in and change your password as soon as possible.</p>
        </div>
      `,
    });

    res.json({ message: 'Temporary password sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
