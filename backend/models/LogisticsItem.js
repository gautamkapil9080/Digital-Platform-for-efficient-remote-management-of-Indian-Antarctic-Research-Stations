const mongoose = require('mongoose');

const LogisticsItemSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  category: {
    type: String,
    enum: ['Food', 'Fuel', 'Medical', 'Equipment', 'Spare Parts'],
    required: true
  },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'units' },
  reorderThreshold: { type: Number, default: 10 },
  lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LogisticsItem', LogisticsItemSchema);
