const express = require('express');
const router = express.Router();
const LogisticsItem = require('../models/LogisticsItem');
const { requireRole } = require('../middleware/auth');

// GET /api/logistics/station/:stationId
router.get('/station/:stationId', async (req, res) => {
  try {
    const items = await LogisticsItem.find({ station: req.params.stationId }).sort({ category: 1, itemName: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logistics - add new inventory item (operator only)
router.post('/', requireRole('operator'), async (req, res) => {
  try {
    const item = await LogisticsItem.create(req.body);
    req.app.get('io').to(String(item.station)).emit('logistics:update', item);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/logistics/:id/restock - bump quantity up (operator only)
router.put('/:id/restock', requireRole('operator'), async (req, res) => {
  try {
    const amount = Number(req.body.amount) || 0;
    const item = await LogisticsItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: amount }, lastRestocked: Date.now() },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    req.app.get('io').to(String(item.station)).emit('logistics:update', item);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/logistics/:id - generic edit (operator only)
router.put('/:id', requireRole('operator'), async (req, res) => {
  try {
    const item = await LogisticsItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    req.app.get('io').to(String(item.station)).emit('logistics:update', item);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
