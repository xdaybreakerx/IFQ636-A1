const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

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
        return res.status(400).json({ message: 'Validation failed', errors });
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
        const events = await Event.find({ organiser: req.user.id }).sort({
            startDate: -1,
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// events attendees can leave feedback on right now
const getOpenEvents = async (req, res) => {
    try {
        // sorting by endDate is the same as sorting by closesAt (end + 240h)
        const events = await Event.find({ status: 'open' }).sort({
            endDate: 1,
        });

        // use the model method so the window rule is only written in one place
        const openEvents = events.filter((event) => event.isFeedbackOpen());
        res.json(openEvents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get single event for feedback form
const getEventById = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Event not found' });
    }

    try {
        const event = await Event.findById(req.params.id);

        // drafts only visible to organiser
        if (
            !event ||
            (event.status === 'draft' &&
                event.organiser.toString() !== req.user.id)
        ) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateEventStatus = async (req, res) => {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Event not found' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organiser.toString() !== req.user.id) {
            return res
                .status(403)
                .json({ message: 'You can only change your own events' });
        }

        // only draft -> open and open -> closed are allowed
        const allowedNext = { draft: 'open', open: 'closed' };
        if (allowedNext[event.status] !== status) {
            return res.status(400).json({
                message: `Can't change status from ${event.status} to ${status}`,
            });
        }

        if (status === 'open' && Date.now() >= event.closesAt.getTime()) {
            return res.status(400).json({
                message:
                    'The feedback window for this event has already passed',
            });
        }

        event.status = status;
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// results for one of the organiser's events, worked out on each request (not stored)
const getEventResults = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Event not found' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organiser.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'You can only view results for your own events',
            });
        }

        // newest first, _id contains the time it was created
        const feedback = await Feedback.find({ event: event._id })
            .populate('user', 'name')
            .sort({ _id: -1 });

        let total = 0;
        const breakdown = { Yes: 0, Partly: 0, No: 0 };
        const responses = [];

        for (const item of feedback) {
            total += item.rating;
            breakdown[item.metExpectations] += 1;

            // name is replaced here so it never reaches the browser
            responses.push({
                _id: item._id,
                name: item.anonymous ? 'Anonymous' : item.user.name,
                rating: item.rating,
                metExpectations: item.metExpectations,
                workedWell: item.workedWell,
                improve: item.improve,
            });
        }

        res.json({
            event,
            count: feedback.length,
            // raw average, the page rounds it
            average: feedback.length > 0 ? total / feedback.length : null,
            breakdown,
            responses,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createEvent,
    getMyEvents,
    getOpenEvents,
    getEventById,
    updateEventStatus,
    getEventResults,
};
