const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true, trim: true },
    slug:          { type: String, unique: true, lowercase: true, trim: true },
    excerpt:       { type: String, trim: true, default: '' },
    content:       { type: String, default: '' },
    featuredImage: { type: String, default: '' },
    category:      { type: String, default: 'General', trim: true },
    tags:          [{ type: String, trim: true }],
    status:        { type: String, enum: ['draft', 'published'], default: 'draft' },
    author:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt:   { type: Date },
  },
  { timestamps: true }
);

/* Auto-generate slug from title (Mongoose 9 — no next()) */
postSchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model('Post', postSchema);
