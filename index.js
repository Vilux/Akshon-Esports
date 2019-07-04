
//declare modules
var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var path = require('path');
var cookieSession = require('cookie-session');
var pino = require('express-pino-logger')();
var routes = require('./routes/index');
var users = require('./routes/users');
var games = require('./routes/games');
var passport = require('passport');
var cors = require('cors');
var nodeEnv = process.env.NODE_ENV;

var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
var teams = require('./routes/teams');

//use modules
var app = express();
app.use(express.json());
app.use(cookieSession({ 
  name: 'session',
  secret: 'keyboard cat',
  secure: false
}));

/* Use the below package for session testing in development */
//app.use(require('express-session')({ secret: 'keyboard cat', resave: true, expires: false, saveUninitialized: true , /*cookie: {maxAge: new Date(Date.now() + (60 * 1000))}*/}));
app.use(bodyParser.urlencoded({ extended: false }));
// set static folder
app.use(express.static(path.join(__dirname, 'public')));
//server logging
//app.use(pino);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors(corsOption));


// express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.');
      var root = namespace.shift();
      var formParam = root;

      while(namespace.length) {
          formParam += '[' + namespace.shift() + ']';
      }

      return {
          param: formParam,
          msg: msg,
          value: value
      }
  }
}));

// set routes
app.use('/', routes);
app.use('/users', users);
app.use('/games', games);
app.use('/teams', teams);

//static path
if (nodeEnv == 'production') { 
  app.use(express.static(path.join(__dirname, 'build')));

  app.use('/*', function (request, response) {
    response.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}


// set port
app.set('port', (process.env.PORT || 3001));


app.listen(app.get('port'), () =>
  console.log('Express server is running on localhost:' + app.get('port'))
);