const Event = require('../models/Event');

const createEvent = async (req, res) => {
    const { title, description, location, startDate, endDate } = req.body;

    const errors = {};

    if (!title || !title.trim()) {
        errors.title = 'Title is required'; 
    } else if (title.length > 100) {
        errors.title = 'Title must be less than 100 characters';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!startDate || isNaN(start)) {
        errors.startDate = 'Start date and time is required';
    }
    if (!endDate || isNaN(end)) {
        errors.endDate = 'End date and time is required';
    } else if (!errors.startDate && end <= start) {
        errors.endDate = 'End must be after start';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({message: 'Validation failed', errors});
    }

    try {
        const event = await Event.create({
            title: title.trim(),
            description,
            location,
            startDate: start,
            endDate: end,
            organiser: req.user._id,
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// only the logged in organisers events
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organiser: req.user.id }).sort({startDate: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEvent, getMyEvents };