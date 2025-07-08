var express = require('express');
var router = express.Router();

// require controllers

const controller = require('../controllers/controller');


router.get('/', controller.homePageGet);
router.get('/about', controller.aboutPageGet);
router.get('/log-in', controller.loginPageGet);
router.post('/log-in', controller.loginPagePost);
router.get('/sign-up', controller.signupPageGet);
router.post('/sign-up', controller.signupPagePost);


/* Admin Functions*/

module.exports = router;
