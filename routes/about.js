var express = require('express');
const app = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res,next) {
  res.render("about" ,{request: req.isAuthenticated()});
})

module.exports = router;
