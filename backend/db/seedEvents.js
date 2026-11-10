// Adds sample events for the seeded organiser, one for each feedback state.
// Run npm run seed first so the organiser exists, then npm run seed:events.
// Dates are relative to now, so run npm run reset:events to get fresh dates.
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');

dotenv.config();

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// date relative to now, e.g. fromNow(-2 * DAY) is two days ago
const fromNow = (ms) => new Date(Date.now() + ms);

const seedEvents = async () => {
    const { ORGANISER_EMAIL } = process.env;

    if (!ORGANISER_EMAIL) {
        console.error('Please set ORGANISER_EMAIL in your .env file');
        process.exit(1);
    }
    await connectDB();

    try {
        const organiser = await User.findOne({
            email: ORGANISER_EMAIL.toLowerCase(),
        });
        if (!organiser) {
            console.error('Organiser not found. Run npm run seed first.');
        } else {
            const existing = await Event.countDocuments({
                organiser: organiser._id,
                title: /^\[Seed\]/,
            });

            if (existing > 0) {
                console.log('Seed events already exist. Skipping creation.');
            } else {
                await Event.insertMany([
                    // listed on Open Events (soonest closing first)
                    {
                        title: '[Seed] Careers Night',
                        startDate: fromNow(-9 * DAY - 3 * HOUR),
                        endDate: fromNow(-9 * DAY),
                        status: 'open',
                        organiser: organiser._id,
                    },
                    {
                        title: '[Seed] Intro to Git Workshop',
                        location: 'QUT Gardens Point, P Block',
                        startDate: fromNow(-2 * DAY - 2 * HOUR),
                        endDate: fromNow(-2 * DAY),
                        status: 'open',
                        organiser: organiser._id,
                    },
                    {
                        title: '[Seed] Hackathon Kick-off',
                        location: 'QUT Kelvin Grove, Z Block',
                        startDate: fromNow(-1 * HOUR),
                        endDate: fromNow(2 * HOUR),
                        status: 'open',
                        organiser: organiser._id,
                    },
                    // not listed
                    {
                        title: '[Seed] Draft - Alumni Panel',
                        startDate: fromNow(-1 * DAY),
                        endDate: fromNow(-1 * DAY + 2 * HOUR),
                        status: 'draft',
                        organiser: organiser._id,
                    },
                    {
                        title: '[Seed] Closed Early - Study Session',
                        startDate: fromNow(-3 * DAY),
                        endDate: fromNow(-3 * DAY + 2 * HOUR),
                        status: 'closed',
                        organiser: organiser._id,
                    },
                    {
                        title: '[Seed] Not Started - Design Sprint',
                        startDate: fromNow(3 * DAY),
                        endDate: fromNow(3 * DAY + 4 * HOUR),
                        status: 'open',
                        organiser: organiser._id,
                    },
                    {
                        title: '[Seed] Window Passed - Orientation',
                        startDate: fromNow(-11 * DAY - 2 * HOUR),
                        endDate: fromNow(-11 * DAY),
                        status: 'open',
                        organiser: organiser._id,
                    },
                ]);
                console.log('Seed events created for ' + ORGANISER_EMAIL);
            }
        }
    } catch (error) {
        console.error('Seed events failed: ', error.message);
    }

    await mongoose.connection.close();
};

seedEvents();
