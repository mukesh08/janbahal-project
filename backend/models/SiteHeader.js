const mongoose = require('mongoose');

const siteHeaderSchema = new mongoose.Schema({
  logoText:     { type: String, default: 'Janbahal', trim: true },
  logoImage:    { type: String, default: '' },
  tagline:      { type: String, default: '', trim: true },
  bgColor:      { type: String, default: '#ffffff' },
  textColor:    { type: String, default: '#0f172a' },
  accentColor:  { type: String, default: '#4f46e5' },
  isSticky:     { type: Boolean, default: true },
  showCta:      { type: Boolean, default: false },
  ctaLabel:     { type: String, default: 'Get Started', trim: true },
  ctaUrl:       { type: String, default: '/contact', trim: true },
  selectedMenu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null },
}, { timestamps: true });

module.exports = mongoose.model('SiteHeader', siteHeaderSchema);
