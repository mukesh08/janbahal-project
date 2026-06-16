const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const Slider  = require('../models/Slider');
const Slide   = require('../models/Slide');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/* slugify + ensure uniqueness */
const makeSlug = async (name) => {
  const base = (name || 'slider').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') || 'slider';
  let slug = base, n = 1;
  while (await Slider.findOne({ slug })) { slug = `${base}-${n++}`; }
  return slug;
};

/* One-time migration: any slides left over from the old flat model (no `slider`
   reference) are moved into a single auto-created "Homepage Hero" slider. */
const migrateOrphanSlides = async () => {
  const orphanCount = await Slide.countDocuments({ slider: { $in: [null, undefined] } });
  if (!orphanCount) return;
  let slider = await Slider.findOne({ slug: 'homepage-hero' });
  if (!slider) slider = await Slider.create({ name: 'Homepage Hero', slug: 'homepage-hero' });
  await Slide.updateMany({ slider: { $in: [null, undefined] } }, { slider: slider._id });
};

const idOrSlugQuery = (idOrSlug) =>
  mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

/* ─── PUBLIC ──────────────────────────────────────────────── */

/* GET /api/slides/public/:idOrSlug — a slider + its active slides (for rendering) */
router.get('/public/:idOrSlug', async (req, res) => {
  try {
    const slider = await Slider.findOne(idOrSlugQuery(req.params.idOrSlug));
    if (!slider) return res.status(404).json({ message: 'Slider not found' });
    const slides = await Slide.find({ slider: slider._id, active: true }).sort({ order: 1, createdAt: 1 });
    res.json({ slider, slides });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── ADMIN: named sliders ────────────────────────────────── */

/* GET /api/slides/sliders — all named sliders with slide counts */
router.get('/sliders', protect, adminOnly, async (req, res) => {
  try {
    await migrateOrphanSlides();
    const sliders = await Slider.find().sort({ createdAt: 1 }).lean();
    const counts  = await Slide.aggregate([{ $group: { _id: '$slider', count: { $sum: 1 } } }]);
    const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));
    res.json(sliders.map(s => ({ ...s, slideCount: countMap[String(s._id)] || 0 })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* POST /api/slides/sliders — create a named slider */
router.post('/sliders', protect, adminOnly, async (req, res) => {
  try {
    const { name, autoplay, interval, height } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    const slug = await makeSlug(name);
    const slider = await Slider.create({ name: name.trim(), slug, autoplay, interval, height });
    res.status(201).json({ ...slider.toObject(), slideCount: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/slides/sliders/:id — update a named slider */
router.put('/sliders/:id', protect, adminOnly, async (req, res) => {
  try {
    const update = {};
    ['name', 'autoplay', 'interval', 'height'].forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const slider = await Slider.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!slider) return res.status(404).json({ message: 'Slider not found' });
    res.json(slider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE /api/slides/sliders/:id — delete a slider and all its slides */
router.delete('/sliders/:id', protect, adminOnly, async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });
    await Slide.deleteMany({ slider: slider._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── ADMIN: slides within a slider ───────────────────────── */

/* GET /api/slides/sliders/:sliderId/slides — all slides (incl. inactive) */
router.get('/sliders/:sliderId/slides', protect, adminOnly, async (req, res) => {
  try {
    const slides = await Slide.find({ slider: req.params.sliderId }).sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* POST /api/slides/sliders/:sliderId/slides — add a slide to a slider */
router.post('/sliders/:sliderId/slides', protect, adminOnly, async (req, res) => {
  try {
    const { sliderId } = req.params;
    if (!await Slider.exists({ _id: sliderId })) return res.status(404).json({ message: 'Slider not found' });
    const { image, heading, subtext, buttonLabel, buttonUrl, buttonTarget, active } = req.body;
    const count = await Slide.countDocuments({ slider: sliderId });
    const slide = await Slide.create({
      slider: sliderId, image, heading, subtext, buttonLabel, buttonUrl, buttonTarget,
      active: active !== undefined ? active : true,
      order: count,
    });
    res.status(201).json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/slides/sliders/:sliderId/slides/reorder — bulk reorder */
router.put('/sliders/:sliderId/slides/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ _id, order }) => Slide.findByIdAndUpdate(_id, { order })));
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/slides/slide/:id — update a single slide */
router.put('/slide/:id', protect, adminOnly, async (req, res) => {
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

/* DELETE /api/slides/slide/:id — delete a single slide */
router.delete('/slide/:id', protect, adminOnly, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
