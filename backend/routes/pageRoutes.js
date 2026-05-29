const express = require('express');
const Page = require('../models/Page');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const INTERNAL_SLUGS = ['__header__', '__footer__'];

// @route  GET /api/pages
// @desc   Get all pages (admin sees all, public sees published) — excludes internal header/footer pages
// @access Public (published) / Private (all)
router.get('/', async (req, res) => {
  try {
    const base = req.headers.authorization ? {} : { published: true };
    const filter = { ...base, slug: { $nin: INTERNAL_SLUGS } };
    const pages = await Page.find(filter)
      .select('title slug published createdAt')
      .sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const DEFAULT_LANDING_HTML = `
<section style="position:relative;padding:6rem 2rem 5rem;text-align:center;overflow:hidden;background-color:#eef2ff;background-image:linear-gradient(160deg,#f8f7ff 0%,#eef2ff 100%);width:100%;box-sizing:border-box;">
  <div style="position:relative;z-index:1;max-width:720px;margin:0 auto;">
    <span style="display:inline-block;padding:0.35rem 1rem;background-color:#ede9fe;color:#5b21b6;border-radius:999px;font-size:0.82rem;font-weight:600;margin-bottom:1.5rem;">AI-Powered Website Builder</span>
    <h1 style="font-size:3.6rem;font-weight:800;line-height:1.15;color:#0f172a;margin-bottom:1.25rem;">Build stunning pages<br><span style="color:#4f46e5;">without writing code</span></h1>
    <p style="font-size:1.15rem;color:#64748b;line-height:1.7;max-width:560px;margin:0 auto 2rem;">Drag, drop and design beautiful web pages. Let AI generate content, layouts and copy — publish in minutes.</p>
  </div>
  <div style="position:absolute;width:400px;height:400px;border-radius:50%;filter:blur(60px);pointer-events:none;top:-80px;right:-100px;background-color:rgba(99,102,241,0.15);"></div>
  <div style="position:absolute;width:300px;height:300px;border-radius:50%;filter:blur(60px);pointer-events:none;bottom:-60px;left:-80px;background-color:rgba(139,92,246,0.12);"></div>
</section>

<section style="width:100%;box-sizing:border-box;background-color:#ffffff;padding:5rem 2rem;">
  <div style="display:flex;flex-wrap:wrap;gap:1.5rem;max-width:1100px;margin:0 auto;">
    <div style="flex:1;min-width:200px;padding:2rem 1.5rem;background-color:#f8fafc;border-radius:16px;border-width:1px;border-style:solid;border-color:#e2e8f0;text-align:center;">
      <span style="font-size:2rem;display:block;margin-bottom:1rem;">🧩</span>
      <h3 style="font-size:1.05rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">Drag &amp; Drop Editor</h3>
      <p style="font-size:0.9rem;color:#64748b;line-height:1.65;margin:0;">Visually build any layout with blocks — no code needed.</p>
    </div>
    <div style="flex:1;min-width:200px;padding:2rem 1.5rem;background-color:#f8fafc;border-radius:16px;border-width:1px;border-style:solid;border-color:#e2e8f0;text-align:center;">
      <span style="font-size:2rem;display:block;margin-bottom:1rem;">🤖</span>
      <h3 style="font-size:1.05rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">AI Content Generation</h3>
      <p style="font-size:0.9rem;color:#64748b;line-height:1.65;margin:0;">Use AI to write headlines, copy and generate full sections instantly.</p>
    </div>
    <div style="flex:1;min-width:200px;padding:2rem 1.5rem;background-color:#f8fafc;border-radius:16px;border-width:1px;border-style:solid;border-color:#e2e8f0;text-align:center;">
      <span style="font-size:2rem;display:block;margin-bottom:1rem;">🚀</span>
      <h3 style="font-size:1.05rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">One-Click Publish</h3>
      <p style="font-size:0.9rem;color:#64748b;line-height:1.65;margin:0;">Publish pages live with a single click and share via a clean URL.</p>
    </div>
    <div style="flex:1;min-width:200px;padding:2rem 1.5rem;background-color:#f8fafc;border-radius:16px;border-width:1px;border-style:solid;border-color:#e2e8f0;text-align:center;">
      <span style="font-size:2rem;display:block;margin-bottom:1rem;">📱</span>
      <h3 style="font-size:1.05rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">Responsive Ready</h3>
      <p style="font-size:0.9rem;color:#64748b;line-height:1.65;margin:0;">Every page looks great on desktop, tablet and mobile.</p>
    </div>
  </div>
</section>

<section style="background-color:#4f46e5;background-image:linear-gradient(135deg,#4f46e5,#7c3aed);padding:5rem 2rem;text-align:center;color:#fff;width:100%;box-sizing:border-box;">
  <h2 style="font-size:2.4rem;font-weight:800;margin-bottom:0.75rem;">Ready to build something beautiful?</h2>
  <p style="font-size:1.05rem;opacity:0.85;margin:0;">Drag, drop and publish stunning pages — no code needed.</p>
</section>

<footer style="display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2.5rem;border-top-width:1px;border-top-style:solid;border-top-color:#f1f5f9;flex-wrap:wrap;gap:0.5rem;width:100%;box-sizing:border-box;background-color:#ffffff;">
  <span style="font-weight:800;color:#4f46e5;font-size:1.1rem;">NewaCore</span>
  <span style="color:#94a3b8;font-size:0.85rem;">© ${new Date().getFullYear()} — AI Website Builder</span>
</footer>`;

// @route  GET /api/pages/ensure-home
// @desc   Get or create the home/landing page, seeded with default layout if new
// @access Private
router.get('/ensure-home', protect, adminOnly, async (req, res) => {
  try {
    let page = await Page.findOne({ slug: 'home' });
    if (!page) {
      page = await Page.create({
        title: 'Home',
        slug: 'home',
        published: true,
        gjsHtml: DEFAULT_LANDING_HTML,
        gjsComponents: [],
        gjsStyles: [],
        createdBy: req.user._id,
      });
    } else if (!page.gjsHtml || page.gjsHtml.includes('min-height:100vh') || page.gjsHtml.includes('border:1px solid') || !page.gjsHtml.includes('background-color')) {
      // reseed: empty, old wrapper, old shorthand border, or no individual background-color props
      page.gjsHtml = DEFAULT_LANDING_HTML;
      page.gjsComponents = [];
      page.gjsStyles = [];
      await page.save();
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const DEFAULT_HEADER_HTML = `
<header style="background-color:#ffffff;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#e2e8f0;position:sticky;top:0;z-index:100;box-shadow:0 1px 6px rgba(0,0,0,0.06);width:100%;box-sizing:border-box;">
  <div style="display:flex;align-items:center;gap:16px;padding:0 2rem;height:60px;max-width:1200px;margin:0 auto;box-sizing:border-box;">
    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
      <div style="width:32px;height:32px;border-radius:8px;background-color:#4f46e5;background-image:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">N</div>
      <span style="font-weight:800;font-size:1rem;color:#0f172a;">NewaCore</span>
    </div>
    <div style="flex:1;"></div>
    <a href="/" style="font-size:0.85rem;color:#64748b;text-decoration:none;font-weight:500;">Home</a>
    <a href="/blog" style="font-size:0.85rem;color:#64748b;text-decoration:none;font-weight:500;">Blog</a>
    <a href="/contact" style="font-size:0.85rem;color:#64748b;text-decoration:none;font-weight:500;">Contact</a>
    <a href="#" style="padding:7px 18px;background-color:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-size:0.82rem;font-weight:600;">Get Started</a>
  </div>
</header>`;

const DEFAULT_FOOTER_HTML = `
<footer style="background-color:#1e293b;color:#94a3b8;width:100%;box-sizing:border-box;">
  <div style="max-width:1100px;margin:0 auto;padding:3rem 2rem 2rem;box-sizing:border-box;">
    <div style="display:flex;flex-wrap:wrap;gap:2.5rem;margin-bottom:2rem;">
      <div style="min-width:160px;">
        <div style="color:#e2e8f0;font-weight:700;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Company</div>
        <a href="/about" style="display:block;color:#64748b;font-size:0.82rem;text-decoration:none;margin-bottom:8px;">About Us</a>
        <a href="/blog" style="display:block;color:#64748b;font-size:0.82rem;text-decoration:none;margin-bottom:8px;">Blog</a>
        <a href="/contact" style="display:block;color:#64748b;font-size:0.82rem;text-decoration:none;margin-bottom:8px;">Contact</a>
      </div>
      <div style="min-width:160px;">
        <div style="color:#e2e8f0;font-weight:700;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Legal</div>
        <a href="/privacy" style="display:block;color:#64748b;font-size:0.82rem;text-decoration:none;margin-bottom:8px;">Privacy Policy</a>
        <a href="/terms" style="display:block;color:#64748b;font-size:0.82rem;text-decoration:none;margin-bottom:8px;">Terms of Service</a>
      </div>
    </div>
    <div style="border-top-width:1px;border-top-style:solid;border-top-color:rgba(255,255,255,0.08);padding-top:1.25rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
      <span style="font-size:0.78rem;color:#475569;">© ${new Date().getFullYear()} NewaCore — All rights reserved</span>
      <div style="display:flex;gap:16px;">
        <a href="#" style="color:#475569;font-size:0.78rem;text-decoration:none;">Twitter</a>
        <a href="#" style="color:#475569;font-size:0.78rem;text-decoration:none;">LinkedIn</a>
        <a href="#" style="color:#475569;font-size:0.78rem;text-decoration:none;">GitHub</a>
      </div>
    </div>
  </div>
</footer>`;

// @route  GET /api/pages/ensure-header
router.get('/ensure-header', protect, adminOnly, async (req, res) => {
  try {
    let page = await Page.findOne({ slug: '__header__' });
    if (!page) {
      page = await Page.create({ title: 'Header', slug: '__header__', published: true, gjsHtml: DEFAULT_HEADER_HTML, gjsComponents: [], gjsStyles: [], createdBy: req.user._id });
    }
    res.json(page);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// @route  GET /api/pages/ensure-footer
router.get('/ensure-footer', protect, adminOnly, async (req, res) => {
  try {
    let page = await Page.findOne({ slug: '__footer__' });
    if (!page) {
      page = await Page.create({ title: 'Footer', slug: '__footer__', published: true, gjsHtml: DEFAULT_FOOTER_HTML, gjsComponents: [], gjsStyles: [], createdBy: req.user._id });
    }
    res.json(page);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// @route  GET /api/pages/header-content  — public, returns gjsHtml+gjsCss for rendering
router.get('/header-content', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: '__header__' }).select('gjsHtml gjsCss');
    res.json(page || { gjsHtml: '', gjsCss: '' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// @route  GET /api/pages/footer-content  — public
router.get('/footer-content', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: '__footer__' }).select('gjsHtml gjsCss');
    res.json(page || { gjsHtml: '', gjsCss: '' });
  } catch (error) { res.status(500).json({ message: error.message }); }
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

// @route  POST /api/pages/:id/duplicate
// @desc   Clone a page
// @access Private (admin)
router.post('/:id/duplicate', protect, adminOnly, async (req, res) => {
  try {
    const original = await Page.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Page not found' });
    const copy = await Page.create({
      title:         `${original.title} (Copy)`,
      gjsHtml:       original.gjsHtml,
      gjsCss:        original.gjsCss,
      gjsComponents: original.gjsComponents,
      gjsStyles:     original.gjsStyles,
      published:     false,
      createdBy:     req.user._id,
    });
    res.status(201).json(copy);
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
