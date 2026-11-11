// Adds sample events for the seeded organiser, one for each feedback state.
// Feedback added to each event for results and My Feedback pages.
// Run npm run seed:users first so the organiser exists, then npm run seed:events.
// Dates are relative to now, so run npm run reset:events to get fresh dates.

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');

const dotenv = require('dotenv');
dotenv.config();

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// date relative to now, e.g. fromNow(-2 * DAY) is two days ago
const fromNow = (ms) => new Date(Date.now() + ms);

// attendee can only leave one feedback per event
// extra attendees generated so events can have more than one response
const demoAttendees = [
    { name: 'Sam Lee', email: 'sam.lee@example.com' },
    { name: 'Priya Patel', email: 'priya.patel@example.com' },
    { name: 'Tom Walker', email: 'tom.walker@example.com' },
];

// second organiser so results for someone else's event can be tested (403)
const demoOrganiser = { name: 'Alex Chen', email: 'alex.chen@example.com' };

const findOrCreateDemoUser = async (demoUser, role) => {
    const existing = await User.findOne({ email: demoUser.email });
    if (existing) {
        return existing;
    }
    // User.create used so the password is hashed
    return User.create({
        ...demoUser,
        password: process.env.ATTENDEE_PASSWORD,
        role,
    });
};

// returns new events or null if already seeded
const seedEvents = async (organiser) => {
    const existing = await Event.countDocuments({
        organiser: organiser._id,
        title: /^\[Seed\]/,
    });

    if (existing > 0) {
        console.log('Seed events already exist. Skipping creation.');
        return null;
    }

    const events = await Event.insertMany([
        // listed on Open Events (soonest closing first)
        {
            title: '[Seed] Careers Night',
            startDate: fromNow(-5 * DAY - 3 * HOUR),
            endDate: fromNow(-5 * DAY),
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

    // open event from another organiser, so attendees see more than one organiser
    // and Postman can find its id through /api/events/open
    const otherOrganiser = await findOrCreateDemoUser(
        demoOrganiser,
        'organiser',
    );
    await Event.create({
        title: '[Seed] Other Organiser - Trivia Night',
        startDate: fromNow(-1 * DAY - 2 * HOUR),
        endDate: fromNow(-1 * DAY),
        status: 'open',
        organiser: otherOrganiser._id,
    });

    console.log('Seed events created for ' + organiser.email);
    return events;
};

// returns feedback to attach to seed events
const seedFeedback = async (events, attendee) => {
    const eventId = (title) =>
        events.find((event) => event.title === title)._id;
    const careers = eventId('[Seed] Careers Night');
    const git = eventId('[Seed] Intro to Git Workshop');
    const passed = eventId('[Seed] Window Passed - Orientation');
    const closedEarly = eventId('[Seed] Closed Early - Study Session');

    const others = [];
    for (const demoAttendee of demoAttendees) {
        others.push(await findOrCreateDemoUser(demoAttendee, 'attendee'));
    }
    const [sam, priya, tom] = others;

    await Feedback.insertMany([
        // Careers Night: several responses for the results page.
        // The main attendee's one makes Open Events show "Already submitted"
        {
            event: careers,
            user: attendee._id,
            rating: 4,
            metExpectations: 'Yes',
            workedWell: 'Good mix of companies',
            improve: 'Name tags would help',
        },
        {
            event: careers,
            user: sam._id,
            rating: 5,
            metExpectations: 'Yes',
            workedWell: 'Talking to recruiters one on one',
        },
        {
            event: careers,
            user: priya._id,
            rating: 3,
            metExpectations: 'Partly',
            improve: 'Too crowded near the end',
            anonymous: true,
        },
        {
            event: careers,
            user: tom._id,
            rating: 4,
            metExpectations: 'Yes',
        },
        // Intro to Git: no feedback from the main attendee,
        // so they can submit it live in the demo and in Postman
        {
            event: git,
            user: sam._id,
            rating: 4,
            metExpectations: 'Yes',
            workedWell: 'The branching exercise',
        },
        {
            event: git,
            user: tom._id,
            rating: 2,
            metExpectations: 'No',
            improve: 'Went too fast for beginners',
            anonymous: true,
        },
        // Window Passed: closed feedback for My Feedback (A1-16)
        {
            event: passed,
            user: attendee._id,
            rating: 3,
            metExpectations: 'Partly',
            improve: 'Too many talks back to back',
        },
        {
            event: passed,
            user: priya._id,
            rating: 4,
            metExpectations: 'Yes',
        },
        // Closed Early: closed by the organiser, the other closed message (A1-16)
        {
            event: closedEarly,
            user: attendee._id,
            rating: 2,
            metExpectations: 'No',
            improve: 'Too noisy to get much done',
        },
        // Hackathon Kick-off has none, for the "No feedback yet" state
    ]);
    console.log('Seed feedback created');
};

const seedEventsAndFeedback = async () => {
    const { ORGANISER_EMAIL, ATTENDEE_EMAIL, ATTENDEE_PASSWORD } = process.env;

    if (!ORGANISER_EMAIL || !ATTENDEE_EMAIL || !ATTENDEE_PASSWORD) {
        console.error(
            'Please set ORGANISER_EMAIL, ATTENDEE_EMAIL and ATTENDEE_PASSWORD in your .env file',
        );
        process.exit(1);
    }
    await connectDB();

    try {
        const organiser = await User.findOne({
            email: ORGANISER_EMAIL.toLowerCase(),
        });
        const attendee = await User.findOne({
            email: ATTENDEE_EMAIL.toLowerCase(),
        });

        if (!organiser || !attendee) {
            console.error(
                'Organiser or attendee not found. Run npm run seed:users first.',
            );
        } else {
            const events = await seedEvents(organiser);
            // only add feedback to freshly seeded events, so running twice skips both
            if (events) {
                await seedFeedback(events, attendee);
            }
        }
    } catch (error) {
        console.error('Seed failed: ', error.message);
    }

    await mongoose.connection.close();
};

seedEventsAndFeedback();
