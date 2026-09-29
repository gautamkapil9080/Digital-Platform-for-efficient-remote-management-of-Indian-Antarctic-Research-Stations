# Antarctic Station Digital Twin — Prototype

Built for SIH Problem Statement **26060** — *Digital Platform for efficient
remote management of Indian Antarctic Research Stations* (MoES / NCPOR,
Smart Automation theme).

## What this actually is (read this first)

A real digital twin for Maitri and Bharati would ingest live SCADA/IoT
telemetry over a satellite link. There's no way to get real sensor feeds
for this prototype, so a **simulator** (`backend/utils/simulator.js`) plays
that role: every few seconds it writes plausible energy, environment,
infrastructure-health and inventory data to MongoDB, exactly the way real
sensors would. Everything downstream of that — the API, the database
schema, the dashboard, the alerting logic — is real, working code, not a
mockup. Swapping the simulator for a real telemetry feed later is a matter
of writing a different data source into the same collections; the rest of
the system doesn't need to change.

No AI/ML is used anywhere, per the brief for this pass. The architecture
leaves room for it later (e.g. predictive maintenance on infrastructure
health, anomaly detection on environment readings) but nothing here does
that today.

## Architecture

```
antarctic-digital-twin/
├── backend/     Node.js + Express + MongoDB (Mongoose) — REST API + simulator
└── frontend/    React (Vite) — dashboard UI, charts via Recharts
```

Two seeded stations (Maitri, Bharati) each carry four monitored domains:

| Module | What it tracks | Where |
|---|---|---|
| **Infrastructure** | Per-unit structural health %, status, internal temp | `models/Infrastructure.js` |
| **Energy** | Solar / wind / diesel output, consumption, battery % | `models/EnergyLog.js` |
| **Logistics** | Food, fuel, medical, equipment, spare-part stock levels | `models/LogisticsItem.js` |
| **Environment** | Temperature, wind speed, humidity, ice thickness, visibility | `models/EnvironmentReading.js` |

The simulator writes new Energy and Environment readings on every tick,
occasionally degrades an infrastructure unit or draws down inventory, and
raises an **Alert** whenever a value crosses a threshold (e.g. battery
under 15%, wind over 100 km/h, stock at or below its reorder point). Alerts
are deduplicated so an ongoing problem doesn't spam the feed.

## Running it

You'll need Node.js 18+ and a MongoDB instance (local or Atlas).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # edit MONGO_URI / JWT_SECRET if needed
npm run seed                # creates Maitri + Bharati + two login accounts
npm run dev                 # starts API + WebSocket server on :5000, and the simulator

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # starts on :5173, proxies /api to :5000
```

Open http://localhost:5173 and log in with one of the seeded accounts:

| Username | Password | Role | Can do |
|---|---|---|---|
| `operator` | `operator123` | Station staff | Everything: restock, resolve alerts, mark units inspected |
| `hq` | `hq123` | NCPOR HQ | View + export only — write buttons are hidden and the API also rejects them server-side |

Every reading is now pushed to the browser the instant the simulator (or a
manual action) creates it, over a Socket.IO connection — there's no polling
loop for the charts/tables anymore. The dashboard summary still refreshes
every 15s as a light backstop.

## API summary

All under `/api`, and (aside from `/auth/login` and `/health`) require an
`Authorization: Bearer <token>` header:

- `POST /auth/login` — get a token; `GET /auth/me` — validate a stored one
- `GET /stations` — both stations with a live summary (battery, open alerts, etc.)
- `GET /infrastructure/station/:id`, `PUT /infrastructure/:id` *(operator only)*
- `GET /energy/station/:id`, `POST /energy` *(operator only)*
- `GET /environment/station/:id`, `POST /environment` *(operator only)*
- `GET /logistics/station/:id`, `PUT /logistics/:id/restock` *(operator only)*
- `GET /alerts?station=&resolved=`, `PUT /alerts/:id/resolve` *(operator only)*
- `GET /export/:module/:stationId?format=csv|pdf` — `:module` is one of
  `energy`, `environment`, `logistics`, `alerts` — downloads a report

**Live events** (Socket.IO, join a station's room by emitting `join-station`
with its ID): `energy:new`, `environment:new`, `infrastructure:update`,
`logistics:update`, `alert:new`, `alert:resolved`.

## Honest limitations of this prototype

- **Auth is real but minimal.** Two hardcoded demo accounts, no signup
  flow, no password reset, no refresh tokens (a token just expires after
  12h and you log in again), and `Socket.IO`'s CORS is wide open
  (`origin: '*'`) for local dev — all of that needs tightening before this
  touches a real network.
- **No real telemetry integration.** The simulator is a stand-in, not a
  driver for actual sensors — that integration work (protocols, hardware,
  satellite bandwidth constraints) is a separate, substantial project on
  its own.
- **Single-region MongoDB.** No offline-first / store-and-forward design
  for the satellite link's intermittent connectivity, which a real
  Antarctic deployment would need.
- **No historical data retention strategy.** Every simulator tick writes a
  new document with no downsampling or archival — fine for a demo, not for
  months of continuous operation.

These are the right next steps if this goes beyond a hackathon prototype,
not things the current build tries to fake.
