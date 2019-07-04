var express = require('express');
var router = express.Router();

// get home page
router.get('/', function(req, res) {
    res.render('index');
});

//basic API call for testing connection
router.get('/api/greeting', (req, res) => {
    const name = req.query.name || 'World';
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});  

module.exports = router;