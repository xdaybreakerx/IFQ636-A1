const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    metExpectations: {
        type: String,
        enum: ['Yes', 'Partly', 'No'],
        required: true,
    },
    workedWell: { type: String, trim: true, maxlength: 500 },
    improve: { type: String, trim: true, maxlength: 500 },
    anonymous: { type: Boolean, default: false },
});

feedbackSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
