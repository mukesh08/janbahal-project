const express = require('express');
const Page = require('../models/Page');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route  GET /api/pages
// @desc   Get all pages (admin sees all, public sees published)
// @access Public (published) / Private (all)
router.get('/', async (req, res) => {
  try {
    const filter = req.headers.authorization ? {} : { published: true };
    const pages = await Page.find(filter)
      .select('title slug published createdAt')
      .sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/pages/ensure-home
// @desc   Get or create the home/landing page (admin)
// @access Private
router.get('/ensure-home', protect, adminOnly, async (req, res) => {
  try {
    let page = await Page.findOne({ slug: 'home' });
    if (!page) {
      page = await Page.create({
        title: 'Home',
        slug: 'home',
        published: true,
        createdBy: req.user._id,
      });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/pages/slug/:slug
// @desc   Get a published page by slug (for viewers)
// @access Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, published: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/pages/:id
// @desc   Get page by ID (admin editor)
// @access Private
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/pages
// @desc   Create a new page
// @access Private (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  const { title } = req.body;
  try {
    const page = await Page.create({
      title,
      createdBy: req.user._id,
    });
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/pages/:id
// @desc   Save GrapesJS editor content
// @access Private (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { title, gjsHtml, gjsCss, gjsComponents, gjsStyles, published } =
    req.body;
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });

    if (title !== undefined) page.title = title;
    if (gjsHtml !== undefined) page.gjsHtml = gjsHtml;
    if (gjsCss !== undefined) page.gjsCss = gjsCss;
    if (gjsComponents !== undefined) page.gjsComponents = gjsComponents;
    if (gjsStyles !== undefined) page.gjsStyles = gjsStyles;
    if (published !== undefined) page.published = published;

    const updated = await page.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  DELETE /api/pages/:id
// @desc   Delete a page
// @access Private (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
