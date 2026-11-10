const express = require('express');
const router = express.Router();

const { createEvent, getMyEvents } = require('../controllers/eventController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('organiser'), createEvent);
router.get('/mine', protect, requireRole('organiser'), getMyEvents);

module.exports = router;
