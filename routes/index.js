var express = require('express');
var router = express.Router();

// require controllers

const controller = require('../controllers/controller');


router.get('/', controller.reservePageGet);
router.post('/', controller.reservePagePost);
router.get('/api/reservations/', controller.getReservations); // query for current reservations

router.get('/confirmation', controller.confirmationPageGet);
router.get('/about', controller.aboutPageGet);
router.get('/log-in', controller.loginPageGet);
router.post('/log-in', controller.loginPagePost);
router.get('/sign-up', controller.signupPageGet);
router.post('/sign-up', controller.signupPagePost);

/* Admin Functions*/

module.exports = router;
