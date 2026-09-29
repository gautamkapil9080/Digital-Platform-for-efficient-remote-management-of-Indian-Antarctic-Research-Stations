const express = require('express');
const router = express.Router();
const EnvironmentReading = require('../models/EnvironmentReading');
const { requireRole } = require('../middleware/auth');

// GET /api/environment/station/:stationId?limit=50
router.get('/station/:stationId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const readings = await EnvironmentReading.find({ station: req.params.stationId })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(readings.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/environment - manually record a reading (operator only)
router.post('/', requireRole('operator'), async (req, res) => {
  try {
    const reading = await EnvironmentReading.create(req.body);
    req.app.get('io').to(String(reading.station)).emit('environment:new', reading);
    res.status(201).json(reading);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
