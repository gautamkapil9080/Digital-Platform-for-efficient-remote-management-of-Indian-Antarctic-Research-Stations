const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },   // e.g. "MAITRI", "BHARATI"
  name: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
    description: String
  },
  established: String,
  overallStatus: {
    type: String,
    enum: ['Normal', 'Advisory', 'Emergency'],
    default: 'Normal'
  }
}, { timestamps: true });

module.exports = mongoose.model('Station', StationSchema);
