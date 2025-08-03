// JWT authentication middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function authenticateJWT(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        req.user = null;
    }
    next();
}

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.user && req.user.userId) {
        return next();
    }
    return res.redirect('/log-in');
}

// Middleware to check if user is admin
function isLabTech(req, res, next) {
    if (req.user && (req.user.userType === 'Admin' || req.user.userType === 'Lab Technician')) {
        return next();
    }
    return res.status(403).render('error', { error: 'Forbidden: Admins only' });
}

module.exports = {
    authenticateJWT,
    isLoggedIn,
    isLabTech
};
