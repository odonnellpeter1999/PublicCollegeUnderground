var User = require("../models/user");
var Token = require("../models/token");
var Review = require("../models/review");
const { Result } = require("express-validator");
var Lecture = require("../models/lecture");
const { body, validationResult } = require('express-validator');
const user = require("../models/user");
const userAuth = require("../config/userAuth");
const userFirstLogIn = require("../config/userFirstLogIn");
const async = require("async");
const lecture = require("../models/lecture");
const review = require("../models/review");

//GET all modules page
exports.lecture_page_get = (req, res, next) => {

    if (!userAuth(req)) { res.redirect("/modules/access_denied") }
    else
        if (!userFirstLogIn(req)) { res.redirect("/modules/review") }

        else {

            Lecture.find({}, "lecture_code link title").exec((err, list_lectures) => {

                if (err) { return next(err) }
                else {
                    // Successful, so render
                    res.render('all_modules', { lecture_list: list_lectures, request: req.user });
                }


            })
        }
}

//GET lecture review page
exports.lecture_review_get = (req, res, next) => {

    Lecture.find({}, "lecture_code link title").exec((err, list_lectures) => {

        if (err) { return next(err) }
        res.render("review_form", { lectures: list_lectures, request: req.user, user:req.user })
    })

}

exports.lecture_review_post = [

    // Validate fields.
    body('lecture', "Lecture is invalid").custom((value, { req, res, next }) => {
        return Lecture.findById(value).then(function (result) {

            if (result == null) {
                throw new Error("Lecture is not avaliable")
            } else {
                return true
            }
        });

    }),
    
    body('tips_and_tricks').custom((value, { req, res, next }) => {
        
        if(value != null || value != undefined ) {

            if(value.length > 300) {
                throw new Error("Tips and Tricks section cannot be over 300 letters in length please keep all tips consise")
            }

            if(value.includes("http")) {
                throw new Error("Tips and Tricks section cannot contain links for user safety")
            }


        }

        return true
    }),

    //Validating all number fields
    body('material_quality', 'All ratings must be within inclusive range 1-10.').custom((value, { req, res, next }) => {

        if (value < 1 || value > 10) {
            throw new Error('All ratings must be within inclusive range 1-10.')
        }


        if (req.body.lecture_quality < 1 || req.body.lecture_quality > 10) {
            throw new Error('All ratings must be within inclusive range 1-10.')
        }

        if (req.body.grading_rating < 1 || req.body.grading_rating > 10) {
            throw new Error('All ratings must be within inclusive range 1-10.')
        }

        if (req.body.difficultly_rating < 1 || req.body.difficultly_rating > 10) {
            throw new Error('All ratings must be within inclusive range 1-10.')
        }

        if (value < 1 || value > 10) {
            throw new Error('All ratings must be within inclusive range 1-10.')
        }

        //validation successful 
        return true

    }),

    //validating User
    body('user', "User is invalid").custom((value, { req, res, next }) => {

        //Checking if User is logged in
        if (req.user == undefined) {
            throw new Error("Please login to review modules")
        }

        //Checking if user is in database
        return User.findById(req.user).then(function (result) {

            if (result == null) {
                throw new Error("User is not avaliable")
            } else if (result.reviews >= 12) {
                throw new Error("You can only review 12 modules a year")
            }
                return true
        });

    }),


    body('user', "You have already reviewed this module please review another").custom((value,{req,res,next}) => {

        return Review.find({ 'user': req.user})
        .then((user_reviews) => {

            if(user_reviews == null) {
                return true;
            }

            user_reviews.forEach(function(review) {

                if(review != undefined) {
                    if(review.lecture == req.body.lecture) {
                        throw new Error("You have already reviewed this module please review another")
                    }
                }

                return true
            })
            


        });
    }),


    // Sanitize fields.
    body('*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {


        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var review = new Review(
            {
                lecture: req.body.lecture,
                user: req.user,
                material_quality: req.body.material_quality,
                lecture_quality: req.body.lecture_quality,
                grading_rating: req.body.grading_rating,
                difficultly_rating: req.body.difficultly_rating,
                isCore: req.body.isCore,
                would_take_again: req.body.would_take_again,
                tips_and_tricks: req.body.tips_and_tricks,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            
            Lecture.find({}, "lecture_code link title").exec((err, list_lectures) => {

                if (err) { return next(err); }

                res.render('review_form', { title: 'Review Module', lectures: list_lectures, errors: errors.array(), request: req.user,review:review,user:req.user });
            });
            return;
        }
        else {
            
            // Data from form is valid. Save review.
            User.findById(req.user._id).exec((err, user) => {

                if (err) { return next(err); }

                user.reviews = user.reviews + 1
                user.save()
            })


            Lecture.findById(req.body.lecture).exec((err, lecture) => {

                if (err) { return next(err); }



                if (lecture.reviews == null) {
                    lecture.reviews = []
                }

                lecture.material_quality += review.material_quality
                lecture.lecture_quality  += review.lecture_quality
                lecture.grading_rating   += review.grading_rating
                lecture.difficultly_rating += review.difficultly_rating

                lecture.overall_score += review.material_quality
                lecture.overall_score += review.lecture_quality
                lecture.overall_score += review.grading_rating
                lecture.overall_score -= review.difficultly_rating
                lecture.overall_score += (lecture.reviews.length + 1) * 2



                if(review.isCore) {
                    lecture.isCore++
                }

                if(review.would_take_again) {
                    lecture.would_take_again++
                    lecture.overall_score += 10
                }

                lecture.rank_score = (lecture.overall_score /(lecture.reviews.length+1)).toFixed(0)


                lecture.reviews.push(review)
                lecture.save()

            })

            review.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new book record.
                if(req.user.reviews>= 3) {
                 res.redirect("/modules/top");
                } else {
                 res.redirect("/modules/review");
                }
            });
        }
    }
];


exports.lecture_top_modules_get = (req, res, next) => {

    if(!userAuth(req)) {res.redirect("/modules/access_denied")}
    if(!userFirstLogIn(req)) {res.redirect("/modules/review")}

    


        Lecture.find({}).sort({rank_score: -1}).exec((err,list_lectures) => {


            list_lectures.forEach(function(lecture) {

                lecture.difficultly_rating =  lecture.difficultly_rating/lecture.reviews.length
                lecture.grading_rating =  lecture.grading_rating/lecture.reviews.length
                lecture.lecture_quality =  lecture.lecture_quality/lecture.reviews.length
                lecture.material_quality =  lecture.material_quality/lecture.reviews.length
                lecture.would_take_again = (lecture.would_take_again/lecture.reviews.length) * 100
                lecture.isCore = (lecture.isCore/lecture.reviews.length) * 100

            }) 

            

            res.render("top_modules", { request: req.user,list_lectures: list_lectures })
    })
}

exports.lecture_please_login_get = (req, res, next) => {
    res.render("please_log_in", { request: req.user })
}


exports.lecture_detail = function(req, res, next) {

    if(!userAuth(req)) {res.redirect("/modules/access_denied")}
    if(!userFirstLogIn(req)) {res.redirect("/modules/review")}

    async.parallel({
        lecture: function(callback) {

            Lecture.findById(req.params.id)
              .exec(callback);
        },
        reviews: function(callback) {

          Review.find({ 'lecture': req.params.id })
          .exec(callback);
        },
    },

    (err,results) => {
       
        if (err) { return next(err); }

       if(results != undefined) 
       for(var counter = 0;counter < results.reviews.length;counter++) {


        if(results.reviews[counter].tips_and_tricks == undefined || results.reviews[counter].tips_and_tricks == null) {
            results.reviews.splice(counter,1)
            counter--
        }
        else if(results.reviews[counter].tips_and_tricks.length < 10) {
            results.reviews.splice(counter,1)
            counter--
        }

       }

        results.lecture.difficultly_rating =  results.lecture.difficultly_rating/results.lecture.reviews.length
        results.lecture.grading_rating =  results.lecture.grading_rating/results.lecture.reviews.length
        results.lecture.lecture_quality =  results.lecture.lecture_quality/results.lecture.reviews.length
        results.lecture.material_quality =  results.lecture.material_quality/results.lecture.reviews.length
        results.lecture.would_take_again = (results.lecture.would_take_again/results.lecture.reviews.length) * 100
        results.lecture.isCore = (results.lecture.isCore/results.lecture.reviews.length) * 100

        

        res.render('module_detail',{lecture:results.lecture, reviews:results.reviews,request: req.user,review_check:(req.user.reviews>=4)})
    })


};
