var express = require('express');
var router = express.Router();
var lectureController = require("../controllers/lectureController")
const passport = require("passport");

//Get all modules page
router.get('/',lectureController.lecture_page_get)

//GET review form
router.get('/review',lectureController.lecture_review_get)

//POST review form
router.post('/review',lectureController.lecture_review_post)

//GET please log in page
router.get('/access_denied',lectureController.lecture_please_login_get)

//GET top Modules page
router.get('/top',lectureController.lecture_top_modules_get)

//GET Module detail page
router.get('/:id',lectureController.lecture_detail)

module.exports = router;




