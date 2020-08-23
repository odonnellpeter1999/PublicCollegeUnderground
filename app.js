var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');               //MongoDB driver
const passport = require("passport");
const session = require("express-session")
var flash = require("connect-flash");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var lecturesRouter = require("./routes/lectures")
var homeRouter = require("./routes/home")
var aboutRouter = require("./routes/about")

var app = express();

const CONNECTION_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const PORT = process.env.PORT || 3000;

// Set up mongoose connection
mongoose.connect(CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false, }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  
  next();
});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use("/modules",lecturesRouter);
app.use("/home",homeRouter);
app.use("/about",aboutRouter);
app.use(express.static(__dirname + '/public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
