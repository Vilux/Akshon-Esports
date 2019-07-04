var express = require('express');
const connection = require('../config/database');
var router = express.Router();

// Add a new Game
router.post('/api/newgame', function (req, res, next) {
        connection.query(`insert into Game(team1ID,team2ID,gamedate,\`set\`,team1picks,team2picks) values(${req.body.team1ID},${req.body.team2ID},'${req.body.gamedate}',${req.body.set},0,0)`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
});

router.get('/api/getgames', function (req, res, next) {
    let date = new Date(Date.now());
    console.log("Unmodified Time:" + (date));
    console.log("Server Time:" + (date.getTime()));
    console.log("offset time: " + (Date.now() + 2.52e+7));
    console.log(date.toLocaleDateString());
    console.log(date.toDateString());
    console.log(date.toGMTString());
    console.log("Time offset: " + (new Date()).getTimezoneOffset());
    try {
        connection.query(`select Game.gameID, Game.team1ID, Game.team2ID, Game.team1score, Game.team2score, Game.gamedate, Game.team1picks, Game.team2picks, 
        Game.set, t1.teamID as t1_teamID, t1.teamName as t1_teamName, t2.teamID as t2_teamID, t2.teamName as t2_teamName, ug.pick, ug.voted, ug.userID, ug.scorepick1, ug.scorepick2 from Game 
        inner join Team t1 on Game.team1ID = t1.teamID inner join Team t2 on Game.team2ID = t2.teamID left join UserGame ug on Game.gameID = ug.gameID;`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Get Games bet on by a specific User
router.get('/api/getusergames/:userID', function (req, res, next) {
    try {
        connection.query(`select Game.gameID, Game.team1ID, Game.team2ID, Game.team1score, Game.team2score, Game.gamedate, Game.team1picks, Game.team2picks, Game.set, t1.teamID as t1_teamID, t1.teamName as t1_teamName, t2.teamID as t2_teamID, t2.teamName as t2_teamName, ug.pick, ug.voted, ug.userID, ug.scorepick1, ug.scorepick2 from Game
        inner join Team t1 on Game.team1ID = t1.teamID inner join Team t2 on Game.team2ID = t2.teamID left join UserGame ug on Game.gameID = ug.gameID AND ug.userID = ${req.params.userID};`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Get all Votes for a specific Game
router.get('/api/getvotes', function (req, res, next) {
    try {
        connection.query(`select voted from UserGame where gameID = ${req.query.gameID}`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Vote for Games
router.post('/api/createvote', function (req, res, next) {
    try {
        connection.query(`
        insert into UserGame(userID,gameID,voted,scorepick1,scorepick2) values(${req.body.userID},${req.body.gameID},true,${req.body.scorepick1},${req.body.scorepick2});`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Add User picks to Game
router.post('/api/increaseteampicks', function (req, res, next) {
    try {
        connection.query(`update Game set ${req.body.pickedTeam} = ${req.body.pickedTeam} + 1 where gameID = ${req.body.gameID}; 
        insert into UserGame(userID,gameID,pick,voted,scorepick1,scorepick2) values(${req.body.userID},${req.body.gameID},${req.body.teamID},true,${req.body.scorepick1},${req.body.scorepick2});`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Update tables when User changes vote
router.post('/api/changevote', function (req, res, next) {
    try {
        connection.query(`
        update Game set ${req.body.unpickedTeam} = ${req.body.unpickedTeam} - 1, ${req.body.pickedTeam} = ${req.body.pickedTeam} + 1 where gameID = ${req.body.gameID};
        update UserGame set pick = ${req.body.teamID} where gameID = ${req.body.gameID} and userID = ${req.body.userID};`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Update tables when User changes score prediction
router.post('/api/changescore', function (req, res, next) {
    try {
        connection.query(`update UserGame set scorepick1 = ${req.body.scorepick1}, scorepick2 = ${req.body.scorepick2} where gameID = ${req.body.gameID} and userID = ${req.body.userID};
        `, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

// Update Game Scores
router.post('/api/addteamscore', function (req, res, next) {
    try {
        connection.query(`update Game set team1score = ${req.body.team1Score}, team2score = ${req.body.team2Score} where gameID = ${req.body.gameID};
        Create VIEW team_winners as select gameID, CASE WHEN team1score > team2score THEN team1ID ELSE team2ID END AS Winning_TeamID from Game WHERE gameID = ${req.body.gameID};
        Create VIEW team_scores as select gameID,team1score,team2score from Game WHERE gameID = ${req.body.gameID};
        create View user_winners as select userID, pick, ug.gameID from UserGame ug INNER JOIN team_winners on team_winners.Winning_TeamID = ug.pick AND ug.gameID = team_winners.gameID;
        create View score_winners as select userID, scorepick1, scorepick2, ug.gameID from UserGame ug INNER JOIN team_scores on team_scores.team1score = ug.scorepick1 AND team_scores.team2score = ug.scorepick2 AND ug.gameID = team_scores.gameID;
        update User u set points = points + 50 where u.userID in (select userID from user_winners);
        update User u set points = points + 100 where u.userID in (select userID from score_winners);
        DROP View user_winners, team_winners, team_scores, score_winners;`, function (error, results, fields) {
            if(results[0].affectedRows < 1){
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

router.delete('/api/deletegame', function (req, res, next) {
    try {
        connection.query(`delete from UserGame where gameID = ${req.body.delGameID}; delete from Game where gameID = ${req.body.delGameID};`, function (error, results, fields) {
            if(results[1].affectedRows < 1){
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

// Delete all Games before specified date
router.delete('/api/deletebydate', function (req, res, next) {
    try {
        connection.query(`delete ug.* from UserGame ug inner join Game g on ug.gameID = g.gameID where g.gamedate < '${req.body.delDate}'; 
        delete from Game where gamedate < '${req.body.delDate}';`, function (error, results, fields) {
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

router.get('/api/getuser', function (req, res, next) {
    try {
        connection.query(`select * from User;`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

router.get('/api/getusergame', function (req, res, next) {
    try {
        connection.query(`select * from UserGame;`, function (error, results, fields) {
            res.send(JSON.stringify(results));
        });
    }
    catch (err) {
        res.send(err);
    }
});

module.exports = router; 