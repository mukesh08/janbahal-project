const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  { label: { type: String, required: true }, url: { type: String, required: true } },
  { _id: true }
);

const columnSchema = new mongoose.Schema(
  { title: { type: String, required: true }, links: [linkSchema] },
  { _id: true }
);

// Single-document singleton — only one footer config
const footerSchema = new mongoose.Schema(
  {
    columns:   { type: [columnSchema], default: [] },
    copyright: { type: String, default: '' },
    socials: {
      type: [{ platform: String, url: String }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Footer', footerSchema);
