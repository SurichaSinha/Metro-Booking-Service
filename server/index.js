const express = require('express');
const cors = require('cors');
const path = require('path');

const stationsRouter = require('./routes/stations');
const routesRouter = require('./routes/routes');
const bookingsRouter = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/stations', stationsRouter);
app.use('/api/routes', routesRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Patna Metro API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/network', (req, res) => {
  const metroNetwork = require('./data/patnaMetroNetwork.json');
  res.json({
    success: true,
    data: metroNetwork,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Patna Metro API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
