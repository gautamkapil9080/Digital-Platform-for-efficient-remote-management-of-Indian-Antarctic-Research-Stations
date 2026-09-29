const express = require('express');
const router = express.Router();
const EnergyLog = require('../models/EnergyLog');
const { requireRole } = require('../middleware/auth');

// GET /api/energy/station/:stationId?limit=50 - history, most recent last
router.get('/station/:stationId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await EnergyLog.find({ station: req.params.stationId })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(logs.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/energy - manually record a reading (operator only)
router.post('/', requireRole('operator'), async (req, res) => {
  try {
    const log = await EnergyLog.create(req.body);
    req.app.get('io').to(String(log.station)).emit('energy:new', log);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
