const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');

const MAX_LENGTH = 500;

const submitFeedback = async (req, res) => {
    const { eventId, rating, metExpectations, workedWell, improve, anonymous } =
        req.body;

    const errors = {};

    const ratingNumber = Number(rating);

    if (
        !Number.isInteger(ratingNumber) ||
        ratingNumber < 1 ||
        ratingNumber > 5
    ) {
        errors.rating = 'Please choose a rating';
    }
    if (!['Yes', 'Partly', 'No'].includes(metExpectations)) {
        errors.metExpectations = 'Please choose an option';
    }
    if (workedWell && workedWell.length > MAX_LENGTH) {
        errors.workedWell = 'Must be 500 characters or less';
    }
    if (improve && improve.length > MAX_LENGTH) {
        errors.improve = 'Must be 500 characters or less';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: 'Validation fail', errors });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(404).json({ message: 'Event not found' });
    }

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // window check first, so a closed event always gives 403
        if (!event.isFeedbackOpen()) {
            return res.status(403).json({
                message: 'Feedback for this event is closed',
                status: event.status,
                closesAt: event.closesAt,
            });
        }

        const existing = await Feedback.findOne({
            event: event._id,
            user: req.user._id,
        });
        if (existing) {
            return res.status(409).json({
                message: "You've already left feedback for this event",
            });
        }

        const feedback = await Feedback.create({
            event: event._id,
            user: req.user._id,
            rating: ratingNumber,
            metExpectations,
            workedWell,
            improve,
            anonymous: anonymous === true,
        });
        res.status(201).json(feedback);
    } catch (error) {
        // catches a double submit that gets past findOne
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You've already left feedback for this event",
            });
        }
        res.status(500).json({ message: error.message });
    }
};

// logged in attendee's feedback with event details
const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ user: req.user._id })
            .populate('event', 'title startDate endDate status location')
            .sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitFeedback, getMyFeedback };
