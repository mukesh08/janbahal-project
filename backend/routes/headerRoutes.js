const express    = require('express');
const router     = express.Router();
const SiteHeader = require('../models/SiteHeader');
const MenuItem   = require('../models/MenuItem');
const { protect } = require('../middleware/authMiddleware');

/* GET /api/header — public; includes nav items from the selected menu */
router.get('/', async (req, res) => {
  try {
    let header = await SiteHeader.findOne().populate('selectedMenu');
    if (!header) header = await SiteHeader.create({});

    let navItems = [];
    if (header.selectedMenu) {
      navItems = await MenuItem.find({ menu: header.selectedMenu._id }).sort({ order: 1 });
    }

    res.json({ ...header.toObject(), navItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/header — protected */
router.put('/', protect, async (req, res) => {
  try {
    const { logoText, logoImage, tagline, bgColor, textColor, accentColor, isSticky, showCta, ctaLabel, ctaUrl, selectedMenu } = req.body;

    let header = await SiteHeader.findOne();
    if (!header) header = new SiteHeader();

    if (logoText    !== undefined) header.logoText    = logoText;
    if (logoImage   !== undefined) header.logoImage   = logoImage;
    if (tagline     !== undefined) header.tagline     = tagline;
    if (bgColor     !== undefined) header.bgColor     = bgColor;
    if (textColor   !== undefined) header.textColor   = textColor;
    if (accentColor !== undefined) header.accentColor = accentColor;
    if (isSticky    !== undefined) header.isSticky    = isSticky;
    if (showCta     !== undefined) header.showCta     = showCta;
    if (ctaLabel    !== undefined) header.ctaLabel    = ctaLabel;
    if (ctaUrl      !== undefined) header.ctaUrl      = ctaUrl;
    /* null means "no menu selected"; undefined means "don't touch it" */
    if (selectedMenu !== undefined) header.selectedMenu = selectedMenu || null;

    const saved = await header.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
