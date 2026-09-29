/*
 * Station simulator.
 *
 * A real deployment would replace this with actual telemetry feeds from
 * SCADA / IoT sensors at Maitri and Bharati. For this prototype it plays
 * the same role: it periodically writes new EnergyLog and
 * EnvironmentReading documents per station, nudges infrastructure health
 * and inventory levels, and raises Alerts when a value crosses a
 * threshold - so every module has live, changing data to show without
 * needing physical hardware in the loop.
 */

const Station = require('../models/Station');
const EnergyLog = require('../models/EnergyLog');
const EnvironmentReading = require('../models/EnvironmentReading');
const Infrastructure = require('../models/Infrastructure');
const LogisticsItem = require('../models/LogisticsItem');
const Alert = require('../models/Alert');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wobble(current, magnitude, min, max) {
  return clamp(current + (Math.random() - 0.5) * magnitude, min, max);
}

async function raiseAlert(io, stationId, module, severity, message) {
  // avoid spamming the same unresolved alert over and over
  const existing = await Alert.findOne({ station: stationId, module, message, resolved: false });
  if (existing) return;
  const alert = await Alert.create({ station: stationId, module, severity, message });
  io.to(String(stationId)).emit('alert:new', alert);
}

async function stepStation(station, io) {
  const room = String(station._id);
  // ---- Environment: Antarctic winter-ish ranges ----
  const lastEnv = await EnvironmentReading.findOne({ station: station._id }).sort({ timestamp: -1 });
  const tempC = wobble(lastEnv ? lastEnv.tempC : -25, 4, -55, -5);
  const windSpeedKmh = wobble(lastEnv ? lastEnv.windSpeedKmh : 40, 15, 0, 160);
  const humidityPercent = wobble(lastEnv ? lastEnv.humidityPercent : 55, 6, 20, 95);
  const iceThicknessCm = wobble(lastEnv ? lastEnv.iceThicknessCm : 120, 1, 60, 250);
  const visibilityKm = wobble(lastEnv ? lastEnv.visibilityKm : 8, 3, 0, 20);

  const envReading = await EnvironmentReading.create({ station: station._id, tempC, windSpeedKmh, humidityPercent, iceThicknessCm, visibilityKm });
  io.to(room).emit('environment:new', envReading);

  if (windSpeedKmh > 100) {
    await raiseAlert(io, station._id, 'Environment', 'Critical', `Blizzard-force winds detected: ${windSpeedKmh.toFixed(0)} km/h`);
  } else if (windSpeedKmh > 70) {
    await raiseAlert(io, station._id, 'Environment', 'High', `High wind speed: ${windSpeedKmh.toFixed(0)} km/h`);
  }
  if (visibilityKm < 1) {
    await raiseAlert(io, station._id, 'Environment', 'High', `Whiteout conditions - visibility ${visibilityKm.toFixed(1)} km`);
  }

  // ---- Energy ----
  const lastEnergy = await EnergyLog.findOne({ station: station._id }).sort({ timestamp: -1 });
  const solarOutputKw = clamp(wobble(lastEnergy ? lastEnergy.solarOutputKw : 5, 3, 0, 30), 0, 30);
  const windOutputKw = clamp(wobble(lastEnergy ? lastEnergy.windOutputKw : 10, 5, 0, 40), 0, 40);
  const dieselOutputKw = clamp(wobble(lastEnergy ? lastEnergy.dieselOutputKw : 15, 4, 0, 50), 0, 50);
  const consumptionKw = clamp(wobble(lastEnergy ? lastEnergy.consumptionKw : 25, 5, 5, 60), 5, 60);
  const totalGeneration = solarOutputKw + windOutputKw + dieselOutputKw;
  const netKw = totalGeneration - consumptionKw;
  let batteryPercent = clamp((lastEnergy ? lastEnergy.batteryPercent : 80) + netKw * 0.3, 0, 100);

  const energyLog = await EnergyLog.create({ station: station._id, solarOutputKw, windOutputKw, dieselOutputKw, consumptionKw, batteryPercent });
  io.to(room).emit('energy:new', energyLog);

  if (batteryPercent < 15) {
    await raiseAlert(io, station._id, 'Energy', 'Critical', `Battery reserve critical: ${batteryPercent.toFixed(0)}%`);
  } else if (batteryPercent < 30) {
    await raiseAlert(io, station._id, 'Energy', 'Medium', `Battery reserve low: ${batteryPercent.toFixed(0)}%`);
  }

  // ---- Infrastructure: occasionally nudge one unit's health ----
  if (Math.random() < 0.15) {
    const units = await Infrastructure.find({ station: station._id });
    if (units.length) {
      const unit = units[Math.floor(Math.random() * units.length)];
      const newHealth = clamp(wobble(unit.structuralHealthPercent, 8, 0, 100), 0, 100);
      let status = 'Operational';
      if (newHealth < 40) status = 'Critical';
      else if (newHealth < 70) status = 'Under Maintenance';
      const updatedUnit = await Infrastructure.findByIdAndUpdate(unit._id, { structuralHealthPercent: newHealth, status }, { new: true });
      io.to(room).emit('infrastructure:update', updatedUnit);

      if (status === 'Critical') {
        await raiseAlert(io, station._id, 'Infrastructure', 'Critical', `${unit.unitName} structural health critical (${newHealth.toFixed(0)}%)`);
      } else if (status === 'Under Maintenance') {
        await raiseAlert(io, station._id, 'Infrastructure', 'Medium', `${unit.unitName} needs maintenance (${newHealth.toFixed(0)}%)`);
      }
    }
  }

  // ---- Logistics: occasionally draw down stock ----
  if (Math.random() < 0.2) {
    const items = await LogisticsItem.find({ station: station._id });
    if (items.length) {
      const item = items[Math.floor(Math.random() * items.length)];
      const drawdown = Math.ceil(Math.random() * 3);
      const newQty = Math.max(0, item.quantity - drawdown);
      const updatedItem = await LogisticsItem.findByIdAndUpdate(item._id, { quantity: newQty }, { new: true });
      io.to(room).emit('logistics:update', updatedItem);

      if (newQty <= item.reorderThreshold) {
        await raiseAlert(io, station._id, 'Logistics', 'Medium', `${item.itemName} (${item.category}) low: ${newQty} ${item.unit} left`);
      }
    }
  }
}

function startSimulator(io, intervalMs = 10000) {
  async function tick() {
    try {
      const stations = await Station.find();
      for (const station of stations) {
        await stepStation(station, io);
      }
    } catch (err) {
      console.error('[simulator] tick failed:', err.message);
    }
  }

  tick(); // run once immediately so the UI has data right away
  const handle = setInterval(tick, intervalMs);
  console.log(`[simulator] running every ${intervalMs}ms`);
  return handle;
}

module.exports = { startSimulator };
