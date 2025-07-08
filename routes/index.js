var express = require('express');
var router = express.Router();

// require controllers

const controller = require('../controllers/controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET about page */
router.get('/about', function(req, res, next) {
  res.render('about');
})

module.exports = router;
