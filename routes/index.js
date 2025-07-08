var express = require('express');
var router = express.Router();

// require controllers

const controller = require('../controllers/controller');


router.get('/', controller.homePage);
router.get('/about', controller.aboutPage);

/* Admin Functions*/

module.exports = router;
