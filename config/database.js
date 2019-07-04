//Database information
const mysql = require('mysql');

// Database Connection for Production

/* WARNING!!!
DO REMOVE ENV VARIABLES FROM app.yaml PRIOR TO PUSHING TO GITHUB AS SENSITIVE DATA WILL BE PUBLIC */

  let config = {
     user: process.env.DB_USER,
     database: process.env.DB_DATABASE,
     password: process.env.DB_PASSWORD,
     multipleStatements: true
 }

 if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
   config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
 } 

// Database Connection for Development
/*
var config = {
  //host: process.env.SQL_HOST,
  //port: process.env.SQL_PORT,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  //socketPath = `/cloudsql/${process.env.SQL_INSTANCE_CONNECTION_NAME}`,
  multipleStatements: true
} */

let connection = mysql.createConnection(config);



  connection.connect(function(err) {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      return;
    }
    console.log('Connected as thread id: ' + connection.threadId);
  });

  module.exports = connection;