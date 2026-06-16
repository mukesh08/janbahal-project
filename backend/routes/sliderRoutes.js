const express = require('express');
const router  = express.Router();
const Slide   = require('../models/Slide');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/* ─── PUBLIC ──────────────────────────────────────────────── */

/* GET /api/slides — active slides for the public slider */
router.get('/', async (req, res) => {
  try {
    const slides = await Slide.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── ADMIN (protected) ───────────────────────────────────── */

/* GET /api/slides/all — every slide, including inactive */
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const slides = await Slide.find().sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* POST /api/slides — create a slide (appended to the end) */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { image, heading, subtext, buttonLabel, buttonUrl, buttonTarget, active } = req.body;
    const count = await Slide.countDocuments();
    const slide = await Slide.create({
      image, heading, subtext, buttonLabel, buttonUrl, buttonTarget,
      active: active !== undefined ? active : true,
      order: count,
    });
    res.status(201).json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/slides/reorder — bulk reorder (must precede /:id) */
router.put('/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ _id, order }) => Slide.findByIdAndUpdate(_id, { order })));
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/slides/:id — update a slide */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const fields = ['image', 'heading', 'subtext', 'buttonLabel', 'buttonUrl', 'buttonTarget', 'active'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    const slide = await Slide.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE /api/slides/:id — remove a slide */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
