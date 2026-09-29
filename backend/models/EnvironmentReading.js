const mongoose = require('mongoose');

const EnvironmentReadingSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  timestamp: { type: Date, default: Date.now },
  tempC: Number,
  windSpeedKmh: Number,
  humidityPercent: Number,
  iceThicknessCm: Number,
  visibilityKm: Number
});

EnvironmentReadingSchema.index({ station: 1, timestamp: -1 });

module.exports = mongoose.model('EnvironmentReading', EnvironmentReadingSchema);
