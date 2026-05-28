const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  homePage:      { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },
  siteThumbnail: { type: String, default: '' },
  siteTagline:   { type: String, default: '', trim: true },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
