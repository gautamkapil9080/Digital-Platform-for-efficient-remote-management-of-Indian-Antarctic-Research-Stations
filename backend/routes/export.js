const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const EnergyLog = require('../models/EnergyLog');
const EnvironmentReading = require('../models/EnvironmentReading');
const LogisticsItem = require('../models/LogisticsItem');
const Alert = require('../models/Alert');
const { toCSV } = require('../utils/csv');
const { streamPdfReport } = require('../utils/pdf');

// Column definitions per module - shared between CSV and PDF so both
// formats always show the same fields.
const MODULES = {
  energy: {
    title: 'Energy log',
    Model: EnergyLog,
    sort: { timestamp: -1 },
    columns: [
      { label: 'Timestamp', get: (r) => new Date(r.timestamp).toLocaleString() },
      { label: 'Solar (kW)', get: (r) => r.solarOutputKw.toFixed(1) },
      { label: 'Wind (kW)', get: (r) => r.windOutputKw.toFixed(1) },
      { label: 'Diesel (kW)', get: (r) => r.dieselOutputKw.toFixed(1) },
      { label: 'Consumption (kW)', get: (r) => r.consumptionKw.toFixed(1) },
      { label: 'Battery (%)', get: (r) => r.batteryPercent.toFixed(0) }
    ]
  },
  environment: {
    title: 'Environment readings',
    Model: EnvironmentReading,
    sort: { timestamp: -1 },
    columns: [
      { label: 'Timestamp', get: (r) => new Date(r.timestamp).toLocaleString() },
      { label: 'Temp (C)', get: (r) => r.tempC.toFixed(1) },
      { label: 'Wind (km/h)', get: (r) => r.windSpeedKmh.toFixed(0) },
      { label: 'Humidity (%)', get: (r) => r.humidityPercent.toFixed(0) },
      { label: 'Ice (cm)', get: (r) => r.iceThicknessCm.toFixed(0) },
      { label: 'Visibility (km)', get: (r) => r.visibilityKm.toFixed(1) }
    ]
  },
  logistics: {
    title: 'Logistics inventory (current snapshot)',
    Model: LogisticsItem,
    sort: { category: 1 },
    columns: [
      { label: 'Category', get: (r) => r.category },
      { label: 'Item', get: (r) => r.itemName },
      { label: 'Quantity', get: (r) => `${r.quantity} ${r.unit}` },
      { label: 'Reorder threshold', get: (r) => `${r.reorderThreshold} ${r.unit}` },
      { label: 'Last restocked', get: (r) => new Date(r.lastRestocked).toLocaleDateString() }
    ]
  },
  alerts: {
    title: 'Alert history',
    Model: Alert,
    sort: { timestamp: -1 },
    columns: [
      { label: 'Timestamp', get: (r) => new Date(r.timestamp).toLocaleString() },
      { label: 'Module', get: (r) => r.module },
      { label: 'Severity', get: (r) => r.severity },
      { label: 'Message', get: (r) => r.message },
      { label: 'Resolved', get: (r) => (r.resolved ? 'Yes' : 'No') }
    ]
  }
};

// GET /api/export/:module/:stationId?format=csv|pdf&limit=200
router.get('/:module/:stationId', async (req, res) => {
  try {
    const config = MODULES[req.params.module];
    if (!config) return res.status(400).json({ error: 'Unknown export module' });

    const station = await Station.findById(req.params.stationId);
    if (!station) return res.status(404).json({ error: 'Station not found' });

    const limit = parseInt(req.query.limit) || 200;
    const rows = await config.Model.find({ station: station._id }).sort(config.sort).limit(limit);
    const format = (req.query.format || 'csv').toLowerCase();
    const filenameBase = `${station.code.toLowerCase()}-${req.params.module}-${Date.now()}`;

    if (format === 'pdf') {
      return streamPdfReport(res, {
        title: `${config.title} - ${station.name}`,
        stationName: station.name,
        columns: config.columns,
        rows,
        filename: `${filenameBase}.pdf`
      });
    }

    const csv = toCSV(rows, config.columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
