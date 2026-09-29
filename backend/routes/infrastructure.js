const express = require('express');
const router = express.Router();
const Infrastructure = require('../models/Infrastructure');
const { requireRole } = require('../middleware/auth');

// GET /api/infrastructure/station/:stationId
router.get('/station/:stationId', async (req, res) => {
  try {
    const units = await Infrastructure.find({ station: req.params.stationId }).sort({ unitName: 1 });
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/infrastructure - add a new unit (operator only)
router.post('/', requireRole('operator'), async (req, res) => {
  try {
    const unit = await Infrastructure.create(req.body);
    req.app.get('io').to(String(unit.station)).emit('infrastructure:update', unit);
    res.status(201).json(unit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/infrastructure/:id - update status / health / notes (operator only)
router.put('/:id', requireRole('operator'), async (req, res) => {
  try {
    const unit = await Infrastructure.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastInspection: Date.now() },
      { new: true, runValidators: true }
    );
    if (!unit) return res.status(404).json({ error: 'Unit not found' });
    req.app.get('io').to(String(unit.station)).emit('infrastructure:update', unit);
    res.json(unit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
