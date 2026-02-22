const express = require('express');
const router = express.Router();
const metroNetwork = require('../data/patnaMetroNetwork.json');
const { findShortestRoute } = require('../services/routeCalculator');

router.get('/', (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      success: false,
      error: 'Both "from" and "to" station IDs are required',
    });
  }

  if (!metroNetwork.stations[from]) {
    return res.status(404).json({
      success: false,
      error: `Source station "${from}" not found`,
    });
  }

  if (!metroNetwork.stations[to]) {
    return res.status(404).json({
      success: false,
      error: `Destination station "${to}" not found`,
    });
  }

  if (from === to) {
    return res.status(400).json({
      success: false,
      error: 'Source and destination cannot be the same',
    });
  }

  const route = findShortestRoute(metroNetwork, from, to);

  if (!route) {
    return res.json({
      success: true,
      data: [],
    });
  }

  res.json({
    success: true,
    data: [{ ...route, isRecommended: true }],
  });
});

module.exports = router;
