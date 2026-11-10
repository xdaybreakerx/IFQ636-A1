// Deletes every event but keeps users. Run once with npm run drop:events.
// Run npm run reset:events to clear events and re-seed them with fresh dates.
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Event = require('../models/Event');

dotenv.config();

const dropEvents = async () => {
    await connectDB();

    try {
        const result = await Event.deleteMany({});
        console.log('Deleted ' + result.deletedCount + ' events');
    } catch (error) {
        console.error('Drop events failed: ', error.message);
    }

    await mongoose.connection.close();
};

dropEvents();
