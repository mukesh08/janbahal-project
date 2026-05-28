const express  = require('express');
const Menu     = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

/* ─── MENUS ─────────────────────────────────────────────── */

/* GET /api/menu  — list all menus (public) */
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find().sort({ createdAt: 1 });
    res.json(menus);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* POST /api/menu  — create a menu (admin) */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const menu = await Menu.create({ name: name.trim(), slug });
    res.status(201).json(menu);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: 'A menu with this name already exists' });
    res.status(500).json({ message: e.message });
  }
});

/* PUT /api/menu/:menuId — rename a menu (admin) */
router.put('/:menuId', protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    if (name?.trim()) {
      menu.name = name.trim();
      menu.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    await menu.save();
    res.json(menu);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* DELETE /api/menu/:menuId — delete menu + all its items (admin) */
router.delete('/:menuId', protect, adminOnly, async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.menuId);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    await MenuItem.deleteMany({ menu: req.params.menuId });
    res.json({ message: 'Menu deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ─── MENU ITEMS ─────────────────────────────────────────── */

/* GET /api/menu/:menuId/items  — all items for a menu (public) */
router.get('/:menuId/items', async (req, res) => {
  try {
    const items = await MenuItem.find({ menu: req.params.menuId }).sort({ order: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* POST /api/menu/:menuId/items  — add item to a menu (admin) */
router.post('/:menuId/items', protect, adminOnly, async (req, res) => {
  try {
    const { label, url, target } = req.body;
    if (!label?.trim() || !url?.trim()) return res.status(400).json({ message: 'Label and URL are required' });
    const count = await MenuItem.countDocuments({ menu: req.params.menuId });
    const item = await MenuItem.create({ menu: req.params.menuId, label: label.trim(), url: url.trim(), target: target || '_self', order: count });
    res.status(201).json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* PUT /api/menu/item/:itemId  — update a single item (admin) */
router.put('/item/:itemId', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* DELETE /api/menu/item/:itemId  — delete a single item (admin) */
router.delete('/item/:itemId', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* PUT /api/menu/:menuId/items/reorder  — bulk reorder items (admin) */
router.put('/:menuId/items/reorder', protect, adminOnly, async (req, res) => {
  try {
    const { items } = req.body;
    await Promise.all(items.map(({ _id, order }) => MenuItem.findByIdAndUpdate(_id, { order })));
    res.json({ message: 'Reordered' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
