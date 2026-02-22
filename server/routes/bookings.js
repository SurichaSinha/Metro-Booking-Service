const express = require('express');
const router = express.Router();

const bookings = new Map();

function generateBookingReference() {
  const prefix = 'PM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

router.post('/', (req, res) => {
  const { source, destination, route } = req.body;

  if (!source || !destination || !route) {
    return res.status(400).json({
      success: false,
      error: 'Source, destination, and route are required',
    });
  }

  const reference = generateBookingReference();
  const validUntil = new Date(Date.now() + 4 * 60 * 60 * 1000);

  const booking = {
    reference,
    source,
    destination,
    route,
    fare: route.fare,
    timestamp: new Date().toISOString(),
    validUntil: validUntil.toISOString(),
    qrData: JSON.stringify({
      ref: reference,
      from: source.id,
      to: destination.id,
      fare: route.fare,
      valid: validUntil.toISOString(),
    }),
  };

  bookings.set(reference, booking);

  res.status(201).json({
    success: true,
    data: booking,
  });
});

router.get('/:reference', (req, res) => {
  const booking = bookings.get(req.params.reference);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found',
    });
  }

  res.json({
    success: true,
    data: booking,
  });
});

module.exports = router;
