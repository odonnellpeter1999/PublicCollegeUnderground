var express = require('express');
const app = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect("/home")
});


module.exports = router;

