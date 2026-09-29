/*
 * One-time seed script. Run with: npm run seed
 * Wipes and recreates the two stations, their infrastructure units and
 * starting inventory. Safe to re-run - it clears old data first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Station = require('../models/Station');
const Infrastructure = require('../models/Infrastructure');
const LogisticsItem = require('../models/LogisticsItem');
const EnergyLog = require('../models/EnergyLog');
const EnvironmentReading = require('../models/EnvironmentReading');
const Alert = require('../models/Alert');
const User = require('../models/User');

async function seed() {
  await connectDB();

  await Promise.all([
    Station.deleteMany({}),
    Infrastructure.deleteMany({}),
    LogisticsItem.deleteMany({}),
    EnergyLog.deleteMany({}),
    EnvironmentReading.deleteMany({}),
    Alert.deleteMany({}),
    User.deleteMany({})
  ]);

  await User.create([
    { username: 'operator', passwordHash: await bcrypt.hash('operator123', 10), role: 'operator', name: 'Station Operator' },
    { username: 'hq', passwordHash: await bcrypt.hash('hq123', 10), role: 'hq', name: 'NCPOR HQ' }
  ]);

  const maitri = await Station.create({
    code: 'MAITRI',
    name: 'Maitri',
    location: { lat: -70.7658, lng: 11.7333, description: 'Schirmacher Oasis, Queen Maud Land' },
    established: '1989'
  });

  const bharati = await Station.create({
    code: 'BHARATI',
    name: 'Bharati',
    location: { lat: -69.4082, lng: 76.1912, description: 'Larsemann Hills, East Antarctica' },
    established: '2012'
  });

  const infraTemplate = [
    ['Main Living Quarters', 'Living Quarters'],
    ['Power House', 'Power House'],
    ['Research Laboratory', 'Laboratory'],
    ['Fuel & Supply Storage', 'Storage'],
    ['Communications Hub', 'Communication'],
    ['Medical Bay', 'Medical Bay'],
    ['Engineering Workshop', 'Workshop']
  ];

  for (const station of [maitri, bharati]) {
    await Infrastructure.insertMany(
      infraTemplate.map(([unitName, type]) => ({
        station: station._id,
        unitName,
        type,
        status: 'Operational',
        internalTempC: 18 + Math.random() * 4,
        structuralHealthPercent: 85 + Math.random() * 15
      }))
    );

    await LogisticsItem.insertMany([
      { station: station._id, category: 'Food', itemName: 'Frozen rations', quantity: 400, unit: 'kg', reorderThreshold: 100 },
      { station: station._id, category: 'Food', itemName: 'Dry rations', quantity: 250, unit: 'kg', reorderThreshold: 80 },
      { station: station._id, category: 'Fuel', itemName: 'Diesel (generator)', quantity: 8000, unit: 'litres', reorderThreshold: 2000 },
      { station: station._id, category: 'Fuel', itemName: 'Aviation fuel', quantity: 1500, unit: 'litres', reorderThreshold: 300 },
      { station: station._id, category: 'Medical', itemName: 'First aid & trauma kits', quantity: 20, unit: 'kits', reorderThreshold: 5 },
      { station: station._id, category: 'Equipment', itemName: 'Spare heaters', quantity: 6, unit: 'units', reorderThreshold: 2 },
      { station: station._id, category: 'Spare Parts', itemName: 'Generator spare parts', quantity: 15, unit: 'units', reorderThreshold: 4 }
    ]);

    // seed one starting reading each so the dashboard isn't empty before the simulator's first tick
    await EnergyLog.create({ station: station._id, solarOutputKw: 5, windOutputKw: 10, dieselOutputKw: 15, consumptionKw: 25, batteryPercent: 80 });
    await EnvironmentReading.create({ station: station._id, tempC: -25, windSpeedKmh: 35, humidityPercent: 55, iceThicknessCm: 120, visibilityKm: 8 });
  }

  console.log('[seed] Maitri and Bharati stations seeded successfully.');
  console.log('[seed] Login as operator/operator123 (read+write) or hq/hq123 (read-only).');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
