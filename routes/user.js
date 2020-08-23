var express = require('express');
var router = express.Router();
var session = require('express-session');




//Bring in Controllers
var userController = require("../controllers/userController")

//Bring in User Model
var User = require("../models/user");

/****************************************************************************************************************************************************************************************
*                                                                                           USER  ROUTES                                                                                *
*****************************************************************************************************************************************************************************************/

//GET registration Form
router.get('/register',userController.user_register_get)

//POST registration form
router.post("/register",userController.user_register_post)

//GET log in Form
router.get('/login',userController.user_login_get)

//POST log in Form
router.post("/login",userController.user_login_post)

//GET log out
router.get("/logout",userController.user_logout_get)

//GET confirmation form 
router.get("/confirmation/:userid",userController.confirmationFormGet)

//POST confirmation form 
router.post("/confirmation/:token",userController.confirmationPost)


//POST resend confirmation email
router.post('/resend', userController.resendTokenPost);

module.exports = router;


