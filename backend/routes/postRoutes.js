const express  = require('express');
const router   = express.Router();
const Post     = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');

/* ─── PUBLIC ──────────────────────────────────────────────── */

/* GET /api/posts  — published posts (for public blog) */
router.get('/', async (req, res) => {
  try {
    const { category, tag, limit = 20, page = 1 } = req.query;
    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag)      query.tags = tag;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content');           // exclude heavy content from list

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET /api/posts/slug/:slug — single post by slug (public) */
router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─── ADMIN (protected) ───────────────────────────────────── */

/* GET /api/posts/all — all posts including drafts */
router.get('/all', protect, async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status)   query.status   = status;
    if (category) query.category = category;

    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort({ updatedAt: -1 })
      .select('-content');

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET /api/posts/categories — distinct categories with counts (public) */
router.get('/categories', async (req, res) => {
  try {
    const cats = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET /api/posts/:id — single post by id (admin, includes content) */
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* POST /api/posts — create */
router.post('/', protect, async (req, res) => {
  try {
    const { title, excerpt, content, featuredImage, category, tags, status } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const post = await Post.create({
      title, excerpt, content, featuredImage,
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      status: status || 'draft',
      author: req.user._id,
    });
    res.status(201).json(post);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A post with this slug already exists' });
    res.status(500).json({ message: err.message });
  }
});

/* PUT /api/posts/:id — update */
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, slug, excerpt, content, featuredImage, category, tags, status } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (title)         post.title         = title;
    if (slug)          post.slug          = slug;
    if (excerpt  !== undefined) post.excerpt = excerpt;
    if (content  !== undefined) post.content = content;
    if (featuredImage !== undefined) post.featuredImage = featuredImage;
    if (category)      post.category      = category;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (status) {
      if (status === 'published' && post.status !== 'published') post.publishedAt = new Date();
      post.status = status;
    }

    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A post with this slug already exists' });
    res.status(500).json({ message: err.message });
  }
});

/* DELETE /api/posts/:id */
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
