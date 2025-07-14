var express = require('express');
var router = express.Router();

// require controllers

const controller = require('../controllers/controller');


router.get('/', controller.reservePageGet);
router.post('/', controller.reservePagePost);
router.get('/api/reservations/', controller.getReservations); // query for current reservations

router.get('/confirmation/:id', controller.confirmationPageGet);
router.get('/about', controller.aboutPageGet);
router.get('/log-in', controller.loginPageGet);
router.post('/log-in', controller.loginPagePost);
router.get('/sign-up', controller.signupPageGet);
router.post('/sign-up', controller.signupPagePost);

router.get('/search/:search_term', controller.UsersSearchGet);
router.get('/user/:id', controller.UserGet);

/* Admin Functions*/
router.get('/admin', controller.adminPageGet);
router.get('/admin/add', controller.reservePageGet);
router.get('/admin/edit', controller.adminEditPageGet);
router.get('/admin/edit/:id', controller.adminEditReserve);
router.put('/admin/edit/:id', controller.adminEditUpdate);
router.delete('/admin/delete/:id', controller.adminDelete);
module.exports = router;
