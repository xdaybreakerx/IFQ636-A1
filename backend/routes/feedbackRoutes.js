const express = require('express');
const router = express.Router();

const {
    submitFeedback,
    getMyFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
} = require('../controllers/feedbackController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('attendee'), submitFeedback);
router.get('/mine', protect, requireRole('attendee'), getMyFeedback);
router.get('/:id', protect, requireRole('attendee'), getFeedbackById);
router.put('/:id', protect, requireRole('attendee'), updateFeedback);
router.delete('/:id', protect, requireRole('attendee'), deleteFeedback);

module.exports = router;
