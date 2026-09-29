const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const EnergyLog = require('../models/EnergyLog');
const EnvironmentReading = require('../models/EnvironmentReading');
const Alert = require('../models/Alert');
const Infrastructure = require('../models/Infrastructure');
const LogisticsItem = require('../models/LogisticsItem');

// GET /api/stations - list all stations with a quick-glance summary
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find().sort({ name: 1 });

    const summaries = await Promise.all(stations.map(async (station) => {
      const [latestEnergy, latestEnv, openAlerts, criticalInfra, lowStock] = await Promise.all([
        EnergyLog.findOne({ station: station._id }).sort({ timestamp: -1 }),
        EnvironmentReading.findOne({ station: station._id }).sort({ timestamp: -1 }),
        Alert.countDocuments({ station: station._id, resolved: false }),
        Infrastructure.countDocuments({ station: station._id, status: 'Critical' }),
        LogisticsItem.countDocuments({ station: station._id, $expr: { $lte: ['$quantity', '$reorderThreshold'] } })
      ]);
      return {
        station,
        latestEnergy,
        latestEnv,
        openAlerts,
        criticalInfra,
        lowStock
      };
    }));

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stations/:id
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
