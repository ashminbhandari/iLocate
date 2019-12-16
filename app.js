var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')
var session = require('express-session');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'cmps369'}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', indexRouter);

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



//Security
var routes = require('./routes/index');
routes.get('/login', function (req, res) {
  res.render('login', {});
});
/* The following user credentials should NEVER be stored liked this!  Always put
   your username/passwords in a database - not code!

   Of course, you'd probably also have MANY usernames and passwords!
*/
var username = "guest";
var password = "finalexam";

// Set up passport to help with user authentication (guest/password)

var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(username, done) {
  // this is called when the user object associated with the session
  // needs to be turned into a string.  Since we are only storing the user
  // as a string - just return the username.
  done(null, username);
});

passport.deserializeUser(function(username, done) {
  // normally we would find the user in the database and
  // return an object representing the user (for example, an object
  // that also includes first and last name, email, etc)
  done(null, username);
});

passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },

    function(user, pswd, done) {
      if ( user != username ) {
        console.log("Username mismatch");
        return done(null, false);
      }

      if(pswd != password) {
        console.log("Password mismatch");
        return done(null, false);
      }
      console.log("Login successful");
      return done(null, user);
    }
));

// Posts to login will have username/password form data.
// passport will call the appropriate functions...
routes.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        res.send("success");
    });
app.use('/', routes);
module.exports = app;
