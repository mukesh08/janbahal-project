const express = require('express');
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all  (public)
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ order: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create  (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const count = await MenuItem.countDocuments();
    const item = await MenuItem.create({ ...req.body, order: count });
    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT update  (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT reorder — accepts array of { _id, order }
router.put('/reorder/bulk', protect, adminOnly, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ _id, order }) =>
      MenuItem.findByIdAndUpdate(_id, { order })
    ));
    res.json({ message: 'Reordered' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE  (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
