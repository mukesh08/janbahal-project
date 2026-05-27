const express = require('express');
const Footer = require('../models/Footer');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// GET footer config  (public)
router.get('/', async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) footer = await Footer.create({});   // auto-create singleton
    res.json(footer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT update entire footer  (admin)
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) footer = new Footer();
    Object.assign(footer, req.body);
    await footer.save();
    res.json(footer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST add column  (admin)
router.post('/columns', protect, adminOnly, async (req, res) => {
  try {
    const footer = await Footer.findOne() || new Footer();
    footer.columns.push({ title: req.body.title || 'New Column', links: [] });
    await footer.save();
    res.json(footer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE column  (admin)
router.delete('/columns/:colId', protect, adminOnly, async (req, res) => {
  try {
    const footer = await Footer.findOne();
    footer.columns = footer.columns.filter(c => c._id.toString() !== req.params.colId);
    await footer.save();
    res.json(footer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST add link to column  (admin)
router.post('/columns/:colId/links', protect, adminOnly, async (req, res) => {
  try {
    const footer = await Footer.findOne();
    const col = footer.columns.id(req.params.colId);
    if (!col) return res.status(404).json({ message: 'Column not found' });
    col.links.push(req.body);
    await footer.save();
    res.json(footer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE link from column  (admin)
router.delete('/columns/:colId/links/:linkId', protect, adminOnly, async (req, res) => {
  try {
    const footer = await Footer.findOne();
    const col = footer.columns.id(req.params.colId);
    col.links = col.links.filter(l => l._id.toString() !== req.params.linkId);
    await footer.save();
    res.json(footer);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
