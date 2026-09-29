const mongoose = require('mongoose');

const InfrastructureSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  unitName: { type: String, required: true },
  type: {
    type: String,
    enum: ['Living Quarters', 'Power House', 'Laboratory', 'Storage', 'Communication', 'Medical Bay', 'Workshop'],
    required: true
  },
  status: {
    type: String,
    enum: ['Operational', 'Under Maintenance', 'Critical'],
    default: 'Operational'
  },
  internalTempC: { type: Number, default: 18 },
  structuralHealthPercent: { type: Number, default: 95, min: 0, max: 100 },
  lastInspection: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Infrastructure', InfrastructureSchema);
