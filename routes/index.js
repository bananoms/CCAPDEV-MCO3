const { isLoggedIn, isAdmin, isTechnician, isStudent } = require('../middleware');
const express = require('express');
const router = express.Router();

// require controllers
const controller = require('../controllers/controller');

// Public routes
router.get('/', controller.reservePageGet);
router.post('/', controller.reservePagePost); // only students can reserve

router.get('/api/reservations/', controller.getReservations); // reservation API (can be public or protected)

router.get('/confirmation/:id', controller.confirmationPageGet);
router.get('/about', controller.aboutPageGet);
router.get('/log-in', controller.loginPageGet);
router.post('/log-in', controller.loginPagePost);
router.get('/sign-up', controller.signupPageGet);
router.post('/sign-up', controller.signupPagePost);

// Search and view users
router.get('/search/:search_term', controller.UsersSearchGet);
router.get('/user/:id', controller.UserGet);

// Admin-only routes
router.get('/admin', isLoggedIn, isAdmin, controller.adminPageGet);
router.get('/admin/add', isLoggedIn, isAdmin, controller.reservePageGet);
router.get('/admin/edit', isLoggedIn, isAdmin, controller.adminEditPageGet);
router.get('/admin/edit/:id', isLoggedIn, isAdmin, controller.adminEditReserve);
router.put('/admin/edit/:id', isLoggedIn, isAdmin, controller.adminEditUpdate);
router.delete('/admin/delete/:id', isLoggedIn, isAdmin, controller.adminDelete);


module.exports = router;
