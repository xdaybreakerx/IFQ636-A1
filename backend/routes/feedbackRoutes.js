const express = require('express');
const router = express.Router();

const {
    submitFeedback,
    getMyFeedback,
} = require('../controllers/feedbackController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('attendee'), submitFeedback);
router.get('/mine', protect, requireRole('attendee'), getMyFeedback);

module.exports = router;
