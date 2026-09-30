require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const { startSimulator } = require('./utils/simulator');
const { requireAuth, SECRET } = require('./middleware/auth');

const authRouter = require('./routes/auth');
const stationsRouter = require('./routes/stations');
const infrastructureRouter = require('./routes/infrastructure');
const energyRouter = require('./routes/energy');
const environmentRouter = require('./routes/environment');
const logisticsRouter = require('./routes/logistics');
const alertsRouter = require('./routes/alerts');
const exportRouter = require('./routes/export');

const app = express();
const httpServer = http.createServer(app);
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  }
};
const io = new Server(httpServer, { cors: corsOptions });

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    socket.data.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});

app.use(cors(corsOptions));
app.use(express.json());
app.set('io', io); // routes reach this with req.app.get('io') to push live updates

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'antarctic-digital-twin-backend' }));
app.use('/api/auth', authRouter);

// Everything below this line requires a valid login. HQ users get read-only
// access; individual routes further restrict writes to 'operator' via requireRole.
app.use('/api', requireAuth);
app.use('/api/stations', stationsRouter);
app.use('/api/infrastructure', infrastructureRouter);
app.use('/api/energy', energyRouter);
app.use('/api/environment', environmentRouter);
app.use('/api/logistics', logisticsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/export', exportRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// A client joins a station's "room" to receive only that station's live
// updates - the dashboard does this whenever the user switches stations.
io.on('connection', (socket) => {
  socket.on('join-station', (stationId) => {
    // leave any previously joined station rooms first
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.leave(room);
    }
    socket.join(String(stationId));
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  startSimulator(io, Number(process.env.SIMULATOR_INTERVAL_MS) || 10000);
  httpServer.listen(PORT, '0.0.0.0', () => console.log(`[server] listening on port ${PORT}`));
})();
