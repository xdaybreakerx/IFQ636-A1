const mongoose = require('mongoose');
const { events } = require('./User');

// feedback stays open for 10 days after the event ends
const FEEDBACK_WINDOW_HOURS = 240;

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['draft', 'open', 'closed'],
        default: 'draft',
    },
    organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

eventSchema.virtual('closesAt').get(function () {
    return new Date(
        this.endDate.getTime() + FEEDBACK_WINDOW_HOURS * 60 * 60 * 1000,
    );
});

eventSchema.methods.isFeedbackOpen = function () {
    const now = Date.now();
    return (
        this.status === 'open' &&
        this.startDate.getTime() <= now &&
        now < this.closesAt.getTime()
    );
};

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
