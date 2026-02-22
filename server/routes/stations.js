const express = require('express');
const router = express.Router();
const metroNetwork = require('../data/patnaMetroNetwork.json');

router.get('/', (req, res) => {
  const stations = Object.values(metroNetwork.stations).map((station) => ({
    ...station,
    lineDetails: station.lines.map((lineId) => {
      const line = metroNetwork.lines.find((l) => l.id === lineId);
      return line ? { id: line.id, name: line.name, color: line.color } : null;
    }).filter(Boolean),
  }));

  res.json({
    success: true,
    data: stations,
  });
});

router.get('/:id', (req, res) => {
  const station = metroNetwork.stations[req.params.id];
  
  if (!station) {
    return res.status(404).json({
      success: false,
      error: 'Station not found',
    });
  }

  const stationWithDetails = {
    ...station,
    lineDetails: station.lines.map((lineId) => {
      const line = metroNetwork.lines.find((l) => l.id === lineId);
      return line ? { id: line.id, name: line.name, color: line.color } : null;
    }).filter(Boolean),
  };

  res.json({
    success: true,
    data: stationWithDetails,
  });
});

module.exports = router;
