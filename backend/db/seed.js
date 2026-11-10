// Create organiser + attendee users.
// Run once with npm run seed.
// Run npm run reset to drop and seed the database with organiser and attendee users.
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

// Load environment variables from .env file for organiser and attendee credentials
dotenv.config();

const seedOrganiser = async () => {
    const { ORGANISER_NAME, ORGANISER_EMAIL, ORGANISER_PASSWORD } = process.env;

    if (!ORGANISER_EMAIL || !ORGANISER_PASSWORD) {
        console.error(
            'Please set ORGANISER_EMAIL, and ORGANISER_PASSWORD in your .env file',
        );
        process.exit(1);
    }
    await connectDB();

    try {
        const existingOrganiser = await User.findOne({
            email: ORGANISER_EMAIL.toLowerCase(),
        });
        if (existingOrganiser) {
            console.log('Organiser user already exists. Skipping creation.');
        } else {
            await User.create({
                name: ORGANISER_NAME || 'Organiser',
                email: ORGANISER_EMAIL.toLowerCase(),
                password: ORGANISER_PASSWORD,
                role: 'organiser',
            });
            console.log(
                'Organiser user created successfully. ' + ORGANISER_EMAIL,
            );
        }
    } catch (error) {
        console.error('Seed failed: ', error.message);
    }

    await mongoose.connection.close();
};

const seedAttendee = async () => {
    const { ATTENDEE_NAME, ATTENDEE_EMAIL, ATTENDEE_PASSWORD } = process.env;

    if (!ATTENDEE_EMAIL || !ATTENDEE_PASSWORD) {
        console.error(
            'Please set ATTENDEE_EMAIL, and ATTENDEE_PASSWORD in your .env file',
        );
        process.exit(1);
    }
    await connectDB();

    try {
        const existingAttendee = await User.findOne({
            email: ATTENDEE_EMAIL.toLowerCase(),
        });
        if (existingAttendee) {
            console.log('Attendee user already exists. Skipping creation.');
        } else {
            await User.create({
                name: ATTENDEE_NAME || 'Attendee',
                email: ATTENDEE_EMAIL.toLowerCase(),
                password: ATTENDEE_PASSWORD,
                role: 'attendee',
            });
            console.log(
                'Attendee user created successfully. ' + ATTENDEE_EMAIL,
            );
        }
    } catch (error) {
        console.error('Seed failed: ', error.message);
    }

    await mongoose.connection.close();
};

const seedUsers = async () => {
    await seedOrganiser();
    await seedAttendee();
};

seedUsers();
