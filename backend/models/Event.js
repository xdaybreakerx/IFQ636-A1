const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true, 
        maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
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
        required: true 
    },
});

module.children.exports = mongoose.model('Event', eventSchema);