const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { requireRole } = require('../middleware/auth');

// GET /api/alerts?station=<id>&resolved=false
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.station) filter.station = req.query.station;
    if (req.query.resolved !== undefined) filter.resolved = req.query.resolved === 'true';
    const alerts = await Alert.find(filter).sort({ timestamp: -1 }).limit(200).populate('station', 'code name');
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts - operator can raise an operational alert from the live view
router.post('/', requireRole('operator'), async (req, res) => {
  try {
    const { station, module, severity = 'Medium', message } = req.body;
    if (!station || !module || !message) {
      return res.status(400).json({ error: 'Station, module, and message are required' });
    }
    const alert = await Alert.create({ station, module, severity, message });
    req.app.get('io').to(String(alert.station)).emit('alert:new', alert);
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/alerts/:id/resolve (operator only)
router.put('/:id/resolve', requireRole('operator'), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { resolved: true }, { new: true });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    req.app.get('io').to(String(alert.station)).emit('alert:resolved', alert);
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
