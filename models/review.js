const mongoose = require("mongoose");

var Schema = mongoose.Schema;


//Token Verification Model
const reviewSchema = new mongoose.Schema({


    //Storing reviewer Details
    lecture: {
        type: Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true,

    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    },
    // Storing Review Details
    material_quality: { 
        type:Number,
        required: true
    },

    lecture_quality: { 
        type:Number,
        required: true
    },
    grading_rating: { 
        type:Number,
        required: true
    },
    difficultly_rating: { 
        type:Number,
        required: true
    },
    isCore: { 
        type:Boolean,
        required: true
    },
    would_take_again: { 
        type:Boolean,
        required: true
    },
    tips_and_tricks: { 
        type:String,
        required: false
    },


});

const Review = module.exports = mongoose.model("Review",reviewSchema)