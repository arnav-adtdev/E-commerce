const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20 // Expanded to allow longer names
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20 // Expanded for flexibility
    },
    email: {
        type: String,
        required: true,
        unique: true, // Enforces unique emails
        trim: true,
        lowercase: true, // Ensures consistency
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    mobile: {
        type: String,
        required: true,
        unique: true, // Enforces unique mobile numbers
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
    },
    
    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the creation date
    },
    updatedAt: {
        type: Date,
        default: Date.now // Tracks updates to the user document
    }
});


module.exports = mongoose.model('User', userSchema);
