const mongoose = require('mongoose');

const EnergyLogSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  timestamp: { type: Date, default: Date.now },
  solarOutputKw: { type: Number, default: 0 },
  windOutputKw: { type: Number, default: 0 },
  dieselOutputKw: { type: Number, default: 0 },
  consumptionKw: { type: Number, default: 0 },
  batteryPercent: { type: Number, default: 80, min: 0, max: 100 }
});

// fast lookup of most recent logs per station
EnergyLogSchema.index({ station: 1, timestamp: -1 });

module.exports = mongoose.model('EnergyLog', EnergyLogSchema);
