var express = require('express');
var router = express.Router();
const connection = require('../config/database');

// Add new Team
router.post('/api/newteam', function (req, res, next) {
    try {
        connection.query(`insert into Team(teamName) values('${req.body.teamName}')`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

router.get('/api/getteams', function (req, res, next) {
    try {
        connection.query(`select * from Team`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Set Team Wins
router.post('/api/setwins', function (req, res, next) {
    try {
        connection.query(`update Team set wins = ${req.body.wins} where teamID = ${req.body.winTeamID}`, function (error, results, fields) {
            if(results.affectedRows < 1){
                res.status(400).send();
            }
            else {
                res.send(JSON.stringify(results));
            }
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Set Team Losses
router.post('/api/setlosses', function (req, res, next) {
    try {
        connection.query(`update Team set losses = ${req.body.losses} where teamID = ${req.body.loseTeamID}`, function (error, results, fields) {
            if(results.affectedRows < 1){
                res.status(400).send();
            }
            else {
                res.send(JSON.stringify(results));
            }
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Delete Team
router.delete('/api/deleteteam', function (req, res, next) {
    try {
        connection.query(`delete from Team where teamID = ${req.body.delTeamID};`, function (error, results, fields) {
            if(results.affectedRows < 1){
                res.status(400).send();
            }
            else {
                res.send(JSON.stringify(results));
            }
        });
    }
    catch (err) {
        res.send(err);
    }
});

module.exports = router; 