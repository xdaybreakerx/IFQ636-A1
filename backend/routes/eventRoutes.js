const express = require('express');
const router = express.Router();

const {
    createEvent,
    getMyEvents,
    getOpenEvents,
    updateEventStatus,
    getEventById,
} = require('../controllers/eventController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('organiser'), createEvent);
router.get('/mine', protect, requireRole('organiser'), getMyEvents);
router.get('/open', protect, requireRole('attendee'), getOpenEvents);
router.get('/:id', protect, getEventById);
router.patch(
    '/:id/status',
    protect,
    requireRole('organiser'),
    updateEventStatus,
);

module.exports = router;
