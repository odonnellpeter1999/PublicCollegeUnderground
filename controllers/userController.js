var User = require("../models/user");
var Token = require("../models/token")
var Lecture = require(("../models/lecture"));
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { body, validationResult } = require('express-validator');
const passport = require("passport");

const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD



//GET register page and renders
exports.user_register_get = (req, res, next) => {
    res.render("registration_form", { request: req.user })
}

//POST when User hits submit on register page
exports.user_register_post = [

    // Validate fields.
    body('username', 'Username must be greater than 5 letters.').isLength({ min: 5 }).trim(),
    body('first_name', 'First name must not be empty.').isLength({ min: 1 }).trim(),
    body('second_name', 'Second name must not be empty.').isLength({ min: 1 }).trim(),
    body('email', 'Email is not valid please check format of email.').isEmail(),
    body('email', 'Email must not be empty.').isLength({ min: 1 }).trim(),
    body('email_confirm', 'Confirm Email must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must be greater than 6 letters.').isLength({ min: 6 }).trim(),
    body('password_confirm', 'Confirm Password must not be empty.').isLength({ min: 1 }).trim(),

    //Checking if email is already used to create an account
    body('email', "Email has already been used to create another account").custom((value, { req, res, next }) => {
        return User.findOne({ email: value }).then(function (result) {
            if (result !== null) {
                throw new Error("Email already is Use")
            } else {
                return true
            }
        });
    }),

    //Checking if email contains @UCDConnect.ie 
    body("email_confirm", "Email is not A UCDConnect Email").custom((value, { req, res, next }) => {

        if (value.endsWith("@ucdconnect.ie")) {
            return true
        } else {
            throw new Error("Email is not a UCDConnect Email")
        }
    }),


    //Checking if username is unique
    body('username', "Username is not avaliable").custom((value, { req, res, next }) => {
        return User.findOne({ username: value }).then(function (result) {
            if (result !== null) {
                throw new Error("Username is not avaliable")
            } else {
                return true
            }
        });
    }),



    //Checking password strength
    body('password', '"Password must contain at least one upper and lower case letter"').custom((value, { req, res, next }) => {

        var i = 0;
        var character = '';
        var isUpperCase = false;
        var isLowerCase = false;
        while (i <= value.length) {
            character = value.charAt(i);
            if (!isNaN(character * 1)) {

            } else {
                if (character == character.toUpperCase()) {
                    isUpperCase = true
                }
                if (character == character.toLowerCase()) {
                    isLowerCase = true
                }
            }

            if (isUpperCase && isLowerCase) {
                break;
            }
            i++;
        }

        if (isUpperCase && isLowerCase) {
            return true
        } else {
            throw new Error("Password must contain at least one upper and lower case letter")
        }
    }),


    //Confirming password in form
    body("password_confirm", "Password and Confirmation Password do not match").custom((value, { req, res, next }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }


        return true;
    }
    ),

    //Confirming email in form
    body("email_confirm", "Email and Confirmation Email do not match").custom((value, { req, res, next }) => {
        if (value !== req.body.email) {
            throw new Error('Email confirmation does not match email');
        }
        return true;
    }
    ),


    // Sanitize fields.
    body('*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {


        // Extract the validation errors from a request.
        const errors = validationResult(req);

        let newUser = new User({

            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            first_name: req.body.first_name,
            second_name: req.body.second_name
        });

        // Create a Book object with escaped and trimmed data.

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            res.render('registration_form', { errors: errors.array(), request: req.user, user:newUser });

        }
        else {
            //Success

            //Generating salt                                                                   note:Salt is random bits generated before hashing to make password more encrypted
            bcrypt.genSalt(10, function (err, salt) {
                //Hashing password with salt
                bcrypt.hash(newUser.password, salt, function (err, hash) {

                    if (err) {
                     
                    }

                    newUser.password = hash;
                    newUser.save(function (err) {
                        if (err) {
                            return;
                        }
                    })
                });

            })

            // Create a verification token for this user
            var token = new Token({ _userId: newUser._id, token: crypto.randomBytes(16).toString('hex') });

            // Save the verification token
            token.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }

                // Send the email
                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL, pass: PASSWORD } });
                var mailOptions = { from: EMAIL, to: newUser.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n' };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
                    res.render("confirmation_email",{request: req.user });
                })


            })


        }
    }
]


//GET login form
exports.user_login_get = (req, res, next) => {

    res.render("login_form", { request: req.user,passport_errors: req.flash('error')})

}


//POST login form
exports.user_login_post = function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureFlash: true,
        failureRedirect: '/user/login',
    })(req, res, next);
};

//GET logout 
exports.user_logout_get = function (req, res) {
    req.logout();
    res.redirect('/home');
};


//POST /confirmation

exports.confirmationPost = [
    body('email', 'Email is not valid').isEmail(),
    body('email', 'Email cannot be blank').notEmpty(),

    body("*").escape(),


    function (req, res, next) {
        // Check for validation errors    
        var errors = validationResult(req);




        if (!errors.isEmpty()) { return res.status(400).render("confirmation_form", { errors: errors.array(), request: req.user }) }

        // Find a matching token
        Token.findOne({ token: req.params.token }, function (err, token) {
            if (token == null) {
                var error = {
                    value: "",
                    msg: "Token does not exist please check your email again or contact System Admin",
                    param: "token",
                    location: "body"
                }
                errors.errors.push(error)

                res.render("confirmation_form", { errors: errors.array(),request: req.user })


            }

            // If we found a token, find a matching user
            User.findOne({ _id: token._userId, email: req.body.email }, function (err, user) {


                if (user == null) {
                    var error = {
                        value: "",
                        msg: "Could not find User associated with token please contact Site Owner",
                        param: "token",
                        location: "body"
                    }
                    errors.errors.push(error)

                    res.render("confirmation_form", { errors: errors.array(),request: req.user })
                }
                else if (user.isVerified) {

                    var error = {
                        value: "",
                        msg: "This email has already been verified, You can already log in",
                        param: "token",
                        location: "body"
                    }

                    errors.errors.push(error)

                    res.render("confirmation_form", { errors: errors.array(),request: req.user })
                } else if(user.emailCap <= 0) {

                    var error = {
                        value: "",
                        msg: "The email cap has been reached for this user please contact System Admin for further help",
                        param: "token",
                        location: "body"
                    }

                    errors.errors.push(error)

                    res.render("confirmation_form", { errors: errors.array(),request: req.user })

                } else {

                    // Verify and save the user
                    user.isVerified = true;
                    user.save(function (err) {
                        if (err) { return res.status(500).send({ msg: err.message }); }
                        res.redirect("/user/login")

                    });
                }
            });
        });


    }
]
//GET confirmation id email
exports.confirmationFormGet = (req, res, next) => {
    res.render("confirmation_form",{request: req.user})
}

//POST confirmation id form
exports.confirmationFormPost = (req, res, next) => {

}



//POST resend confirmation email
exports.resendTokenPost = function (req, res, next) {
    body('email', 'Email is not valid').isEmail();
    body('email', 'Email cannot be blank').notEmpty();
    body('email').normalizeEmail({ remove_dots: false });

    // Check for validation errors    
    var errors = validationResult(req);


    if (!errors.isEmpty()) return res.status(400).send(errors);

    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });


        // Create a verification token, save it, and send email
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

        // Save the token
        token.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }

            // Send the email
            var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: EMAIL, pass: PASSWORD } });
            var mailOptions = { from: EMAIL, to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + token.token + '.\n' };
            transporter.sendMail(mailOptions, function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.render("confirmation_email");
            });
        });

    });
};













