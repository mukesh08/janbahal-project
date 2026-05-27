const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // GrapesJS stores HTML, CSS, and JSON components separately
    gjsHtml: {
      type: String,
      default: '',
    },
    gjsCss: {
      type: String,
      default: '',
    },
    gjsComponents: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    gjsStyles: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving
pageSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Page', pageSchema);
