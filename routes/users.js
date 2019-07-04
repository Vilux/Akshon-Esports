var express = require('express');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var LocalStrategy = require('passport-local').Strategy;

const connection = require('../config/database');

var requestServer = require('request');

/* // Set up connection to database.
var connection = mysql.createConnection({
  //host: process.env.SQL_HOST,
  //port: process.env.SQL_PORT,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  //socketPath = `/cloudsql/${process.env.SQL_INSTANCE_CONNECTION_NAME}`,
  multipleStatements: true
});
 */

// Connect to database.
//connection.connect();


/* Google client ID and secret key for oauth, DO NOT REVEAL THESE IN LIVE PRODUCTION.
 * Please replace these tokens with your oauth tokens, as they will not work after May 11th.
 */
//client ID and secret, do not reveal these in live production
process.env['GOOGLE_CLIENT_ID'] = '814997748616-6ob3gdrqrvgrvctlcfctl8dmfflninn0.apps.googleusercontent.com';
process.env['GOOGLE_CLIENT_SECRET'] = 'YSASnEkUjKLwZ27BjQtwHMiw';

/* Google authentication that utilizes a dependency called 'passport-google-oauth20'. 
 * Returns an object (preferrably non-sensitive user credentials) that passport.serializeUser
 * will then use to attach to the session as req.session.passport.user = {}.
 */
passport.use('google', new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  // Change callbackURL to speedy-equator when deploying 
   callbackURL: 'https://speedy-equator-238017.appspot.com/users/auth/google/callback',
  // callbackURL: 'http://localhost:3001/users/auth/google/callback',
  passReqToCallback: true
},
  function (req, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      connection.query(`select * from User where googleID = '${profile.id}'`, function (error, results, fields) {
        if (error) return done(error, false); //If SQL query error
        if (results.length > 0) { 
          //If user exists log them in
          req.session.user = results[0].email;
          req.session.role_id = results[0].roleID;
          return done(null, results[0]);
        }
        else {
          //New Google user, let's insert their credentials into the database.
          //By default, username is just a trimmed email. Later on, we could prompt the user to finish their profile
          let username  = profile.emails[0].value.substring(0, profile.emails[0].value.lastIndexOf("@"));
          connection.query(`insert into User(username, email, points, roleID, googleID, password) values('${username}', '${profile.emails[0].value}', 0, 1, ${profile.id}, NULL)`, function (error, results, fields) {
            if (error) {
              //If SQL error
              console.log(error);
              res.status(500).send();
              return done(error, false);
            }
              //Get User credentials from database and return that.
              //It would be better to store the user credentials in a User class and return that instead.
            connection.query(`select * from User where googleID = '${profile.id}'`, function (error, results, fields) {
              req.session.user = results[0].email;
              req.session.role_id = results[0].roleID;
              return done(null, results[0]);
            });
          });
        }
      });
    });
  }
));


/* Local login authentication.
 * Returns an object (preferrably non-sensitive user credentials) that passport.serializeUser
 * will then use to attach to the session as req.session.passport.user = {}.
 */
passport.use('local-login', new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password',
  passReqToCallback: true //Get request headers to pass to callback
}, function (req, user, password, done) {

  //Server side checking, also sanitizing inputs for any SQL injection attacks.
  req.checkBody('Username', 'Username is required').notEmpty().trim().escape();
  req.checkBody('Password', 'Password is required').notEmpty().trim().escape();

  var errors = req.validationErrors(); //If server validation fails

  //If no errors occured do login process
  if (!errors) {
    process.nextTick(function () {
      //SELECT QUERY
      connection.query(`select * from User where email = '${user}' OR username = '${user}'`, function (error, results, fields) {
        if (error) {
          //SQL error
          console.log("error in local: " + error);
          return done(error, false);
        }
        //If user exists in database, and the password matches.
        //Right now, passwords are stored as plaintext. The server should encrypt passwords during registration process.
        if (results.length > 0 && results[0].password == password) {
          req.session.user = results[0].email;
          req.session.role_id = results[0].roleID;
          return done(null, results[0])
        }
        else { 
          //User account doesn't exist
          return done(null, false);
        }
      });
    });
  }
  else {
    console.log(errors);
    return done(null, false);
  }
}
));

/* Local register authentication.
 * Returns an object (preferrably non-sensitive user credentials) that passport.serializeUser
 * will then use to attach to the session as req.session.passport.user = {}.
 * DO NOTE THAT PASSWORDS ARE NOT HASHED OR ENCRYPTED, THEY ARE STORED AS PLAINTEXT.
 */
passport.use('local-register', new LocalStrategy({
  usernameField: 'Email',
  passwordField: 'Password',
  passReqToCallback: true //Pass request headers to function
}, function (req, email, password, done) {

  //Server side checking, also sanitizing inputs for any SQL injection attacks.
  req.checkBody('Email', 'Email is required').notEmpty().trim().escape();
  req.checkBody('Username', 'Username is required').notEmpty().trim().escape();
  req.checkBody('Email', 'Email is not valid').isEmail().normalizeEmail();
  req.checkBody('Password', 'Password is required').notEmpty().trim().escape();
  req.checkBody('ConfirmPassword', 'Passwords do not match').trim().escape().equals(req.body.Password);

  var errors = req.validationErrors(); //Check if server validation fails

  //If no errors occured do registration process
  if (!errors) {
    process.nextTick(function () {
      //SELECT QUERY
      connection.query(`select * from User where email = '${email}'`, function (error, results, fields) {
        if (error) {
          //If SQL error
          console.log("error in local: " + error);
          return done(error, false);
        }
        if (results.length > 0) {
          //User already exists in the database, deny registration
          return done(error, false);
        }
        else {
          //User doesn't exist, let's create them
          connection.query(`insert into User(username, email, points, googleID, password, roleID) values('${req.body.Username}', '${email}', 0, NULL, '${password}', 1)`,
            function (error, results, fields) {
              if (error) {
                //If SQL error
                console.log(error);
                return done(error, false);
              }
              //Get User credentials from database and return that.
              //It would be better to store the user credentials in a User class and return that instead.
              connection.query(`select * from User where email = '${email}'`, function (error, results, fields) {
                req.session.user = results[0].email;
                req.session.role_id = results[0].roleID;
                console.log(results[0]);
                return done(null, results[0]);
              });
            });
        }
      });
    });
  }
  else {
    //Server-side validation failed
    console.log(errors);
    return done(null, false);
  }
}
));

/* Creates a session with user credentials,
 * which is saved as req.session.passport.user = {id: '..'}
 */
passport.serializeUser(function (user, done) {
  done(null, user);
});

/* Attaches to the request header as req.user
 */
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// get register route
router.get('/Register', function (req, res) {
  res.redirect('Register');
});

/* When invoked, logs the users out.
 */
router.get('/Logout', function (req, res) {
  var logout = new Promise( (resolve, reject) => {
    req.logOut(); //So we can set req.isAuthenticated() to false.
    req.session = null; //Delete any stored session variables
    resolve(); //Return promise
  } );
  logout.then( () => res.end());

});

/* When invoked, gets the leaderboard using a SELECT query.
 * Ideally we shouldn't have it as a SQL query as it'll be taxing on the database.
 * Maybe store it as a JSON file locally in the server?
 */
router
router.get('/api/getleaderboard', function (req, res) {
  try {
    connection.query(`SET @row_number = 0; select (@row_number:=@row_number + 1) AS rank, username, points from User order by points desc;`, function (error, results, fields) {
      res.send(JSON.stringify(results[1]));
    });
  }
  catch (err) {
    res.send(err);
  }
});

/* Check if client session matches server session, for now it compares userID/emails
 */
router.get('/api/LoggedIn',
  function (req, res) {
    //Does the client and server session match? And, are they logged in?
    //passport.serializeUser & passport.deserializeUser are responsible for setting isAuthenticated to true.
    if ((req.query.sessionID === req.session.user) && req.isAuthenticated()) {
      res.send(JSON.stringify(req.user));
    }
    else {
      res.status(401).send(JSON.stringify([{ 'NotAllowed': true }]));
    }
  });

/* Router redirect for third-party Google authentication.
 */
router.get('/auth/google', passport.authenticate('google', {
  scope: ['email',
    'profile']
}));

/* Router redirect for when user has finished authenticating with Google.
 */
router.get('/auth/google/callback',
  passport.authenticate('google'),
  function (req, res) {
    console.log(req.isAuthenticated());
    //For live production, use /GameDisplay
    res.redirect('/GameDisplay');
    //res.redirect('http://localhost:3000/GameDisplay');
  });

/* Debugging function to ensure that local user login is working.
 */
/*router.post('/auth/local', 
function (req, res, next) {
  // call passport authentication passing the "local" strategy name and a callback function
  passport.authenticate('local', function (error, user, info) {
    // this will execute in any case, even if a passport strategy will find an error
    // log everything to console
    console.log("err: " +error);
    console.log(user);
    console.log("info: " +info);

    if (error) {
      res.status(401).send(error);
    } else if (!user) {
      res.status(401).send(info);
    } else {
      next();
    }

    res.status(401).send(info);
  })(req, res);
},

// function to call once successfully authenticated
function (req, res) {
  res.status(200).send('logged in!');
}); */

/* Routes for local login and register.
 */
router.post('/auth/local/login',
  passport.authenticate('local-login'),
  function (req, res) {
      res.status(200).send(JSON.stringify(req.session.user));
  });

router.post('/auth/local/register',
  passport.authenticate('local-register'),
  function (req, res) {
      res.status(200).send(JSON.stringify(req.session.user));
  });

/* API call to return user's session. For now it only returns the ID if user has logged in.
 */
router.get('/api/GetUser', (req, res) => {
  if (req.isAuthenticated()) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(req.session.user));
  }
  else if (!req.isAuthenticated()) {
    res.status(401).send(JSON.stringify([{ 'NotAllowed': true }]));
  }
});

//error logging
router.use(function (err, req, res, next) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('404')
  }
});

module.exports = router; 
