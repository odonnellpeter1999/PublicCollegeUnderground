const mongoose = require("mongoose");


//User schema 
const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },

    second_name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    passwordResetToken: String,

    passwordResetExpires: Date,

    isVerified: {
        type: Boolean,
        default: false
    },

    emailCap: {
        type: Number,
        default: 4
    },

    reviews: {
        type: Number,
        default: 0
    },

    isFirstLogIn: {
        type: Boolean,
        default: true
    },

    

});


const User = module.exports = mongoose.model("User",UserSchema)