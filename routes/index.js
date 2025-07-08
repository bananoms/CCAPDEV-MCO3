var express = require('express');
var router = express.Router();

// require controllers

const controller = require('../controllers/controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send('hello')
});

module.exports = router;
