// Clears every collection in the database. Run once with npm run drop.
// Run npm run reset to drop and seed the database with organiser and attendee users, and events.
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

dotenv.config();

const dropDB = async () => {
    await connectDB();

    try {
        const collections = await mongoose.connection.db.collections();

        for (const collection of collections) {
            await collection.drop();
            console.log('Dropped ' + collection.collectionName);
        }
        console.log('Database cleared');
    } catch (error) {
        console.error('Drop failed: ', error.message);
    }

    await mongoose.connection.close();
};

dropDB();
