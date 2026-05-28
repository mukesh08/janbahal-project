const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  menu:   { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  label:  { type: String, required: true, trim: true },
  url:    { type: String, required: true, trim: true },
  target: { type: String, enum: ['_self', '_blank'], default: '_self' },
  order:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
