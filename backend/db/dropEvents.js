// Deletes every event and its feedback but keeps users.
// Run once with npm run drop:events.
// Run npm run reset:events to clear events and re-seed them with fresh dates.
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Event = require('../models/Event');
const Feedback = require('../models/Feedback');

const dotenv = require('dotenv');
dotenv.config();

const dropEvents = async () => {
    await connectDB();

    try {
        const result = await Event.deleteMany({});
        console.log('Deleted ' + result.deletedCount + ' events');

        // feedback belongs to event, so its deleted too
        const feedbackResult = await Feedback.deleteMany({});
        console.log('Deleted ' + feedbackResult.deletedCount + ' feedback');
    } catch (error) {
        console.error('Drop events failed: ', error.message);
    }

    await mongoose.connection.close();
};

dropEvents();
