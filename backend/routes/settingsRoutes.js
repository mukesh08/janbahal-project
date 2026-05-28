const express      = require('express');
const router       = express.Router();
const SiteSettings = require('../models/SiteSettings');
const { protect }  = require('../middleware/authMiddleware');

/* GET /api/settings — public; populates homePage content for Landing */
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne()
      .populate('homePage', 'title slug gjsHtml gjsCss published _id');
    if (!settings) settings = await SiteSettings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/settings — protected */
router.put('/', protect, async (req, res) => {
  try {
    const { homePage, siteThumbnail, siteTagline } = req.body;

    let settings = await SiteSettings.findOne();
    if (!settings) settings = new SiteSettings();

    if (homePage      !== undefined) settings.homePage      = homePage || null;
    if (siteThumbnail !== undefined) settings.siteThumbnail = siteThumbnail;
    if (siteTagline   !== undefined) settings.siteTagline   = siteTagline;

    const saved = await settings.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
