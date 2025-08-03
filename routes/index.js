
const { isLoggedIn, isLabTech, isAdmin } = require('../middleware');
const express = require('express');
const router = express.Router();

// require controllers
const controller = require('../controllers/controller');

// Public routes
router.get('/', controller.reservePageGet);
router.post('/', controller.reservePagePost);

router.get('/api/reservations/', controller.getReservations); // reservation API (can be public or protected)

router.get('/confirmation/:id', controller.confirmationPageGet);
router.get('/about', controller.aboutPageGet);
router.get('/log-in', controller.loginPageGet);
router.post('/log-in', controller.loginPagePost);
router.get('/log-out', controller.logOut);
router.get('/sign-up', controller.signupPageGet);
router.post('/sign-up', controller.signupPagePost);

// Search and view users
router.get('/search/:search_term', isLoggedIn, controller.UsersSearchGet);
router.get('/user/:id',  isLoggedIn, controller.UserGet);

// Admin or Lab Tech Routes routes
router.get('/admin', isLoggedIn, isLabTech, controller.adminPageGet);   
router.get('/admin/add', isLoggedIn, isLabTech, controller.reservePageGet);
router.get('/admin/edit', isLoggedIn, isLabTech, controller.adminEditPageGet);
router.get('/admin/edit/:id', isLoggedIn, isLabTech, controller.adminEditReserve);
router.put('/admin/edit/:id', isLoggedIn, isLabTech, controller.adminEditUpdate);
router.delete('/admin/delete/:id', isLoggedIn, isLabTech, controller.adminDelete);

// Admin only routes
router.get('/admin/users', isLoggedIn, isAdmin, controller.adminUsers);
router.delete('/admin/users/delete/:id', isLoggedIn, isAdmin, controller.UserDelete);
module.exports = router;
