function isLoggedIn(req, res, next) {
  if (!req.session.userId) return res.redirect('/log-in');
  next();
}

function isAdmin(req, res, next) {
  if (req.session.userType !== 'Admin') return res.status(403).send('Access denied: Admins only');
  next();
}

function isTechnician(req, res, next) {
  if (req.session.userType !== 'Lab Technician') return res.status(403).send('Access denied: Technicians only');
  next();
}

function isStudent(req, res, next) {
  if (req.session.userType !== 'Student') return res.status(403).send('Access denied: Students only');
  next();
}

module.exports = { isLoggedIn, isAdmin, isTechnician, isStudent };
