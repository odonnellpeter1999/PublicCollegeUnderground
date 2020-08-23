const mongoose = require("mongoose");
var Schema = mongoose.Schema;


//Token Verification Model
const lectureSchema = new mongoose.Schema({


    // Storing link to module details
    link: { type:String,
        required: true
    },

    // UCD module code
    lecture_code: { type: String,
        required: true
    },

    //Module title
    title: { type: String, 
        required: true 
    },

    //All review Object Ids
    reviews: [{type: Schema.ObjectId, ref: 'Review'}],

    material_quality: { 
        type:Number,
        required: true,
        default: 0
    },

    lecture_quality: { 
        type:Number,
        required: true,
        default: 0
    },
    grading_rating: { 
        type:Number,
        required: true,
        default: 0
    },
    difficultly_rating: { 
        type:Number,
        required: true,
        default: 0
    },
    isCore: { 
        type:Number,
        required: true,
        default: 0
    },
    would_take_again: { 
        type:Number,
        required: true,
        default: 0
    },

    overall_score: { 
        type:Number,
        required: true,
        default: 0
    },

    rank_score: { 
        type:Number,
        required: true,
        default: 0
    },

    
});

lectureSchema
.virtual('url')
.get(function () {
  return '/modules/'+this._id;
});

const Lecture = module.exports = mongoose.model("Lecture",lectureSchema)