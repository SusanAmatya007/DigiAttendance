module.exports = {
    ensureCommonAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login?error=Access denied or not logged in...');
    },
    ensureSuperAdminAuthenticated: function (req, res, next) {
        if (req.isAuthenticated() && req.user.role === "SuperAdmin") {
            return next();
        }
        res.redirect('/login?error=Access denied or not logged in...');
    },
    ensureTeacherAuthenticated: function (req, res, next) {
        if (req.isAuthenticated() && req.user.role === "Teacher") {
            return next();
        }
        res.redirect('/login?error=Access denied or not logged in...');
    }
};