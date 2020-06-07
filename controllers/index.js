const passport = require("passport");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const { ensureCommonAuthenticated, ensureSuperAdminAuthenticated, ensureTeacherAuthenticated } = require("../config/auth");

const teacherModel = mongoose.model("Teacher");
const batchModel = mongoose.model("Batch");
const subjectModel = mongoose.model("Subject");
const studentModel = mongoose.model("Student");
const allocationModel = mongoose.model("Allocation");
const attendanceModel = mongoose.model("Attendance");
const teacherController = require("./teacher.controller");
const batchController = require("./batch.controller");
const subjectController = require("./subject.controller");
const studentController = require("./student.controller");
const allocationController = require("./allocation.controller");
const attendanceController = require("./attendance.controller");

router.use("/teacher", ensureSuperAdminAuthenticated, teacherController);
router.use("/batch", ensureSuperAdminAuthenticated, batchController);
router.use("/subject", ensureSuperAdminAuthenticated, subjectController);
router.use("/allocation", ensureSuperAdminAuthenticated, allocationController);
router.use("/student", ensureTeacherAuthenticated, studentController);
router.use("/attendance", ensureTeacherAuthenticated, attendanceController);

router.get("/", (req, res) => {
    res.redirect("login");
});

router.get("/login", (req, res) => {
    res.render("core/login", {
        formTitle: "Login",
        errorExists : req.query.error
    });
});

router.get("/admin-desk", ensureSuperAdminAuthenticated, (req, res) => {
    res.render("core/adminDesk", {
        user: req.user.fullName
    });
});

router.get("/teacher-desk", ensureTeacherAuthenticated, (req, res) => {
    res.render("core/teacherDesk", {
        user: req.user.fullName
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            return res.render("core/login", {
                formTitle: "Login",
                teacherId : req.body.teacherId,
                errorExists: "Incorrect Credentials."
            });
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            if (user.role == "SuperAdmin") {
                return res.redirect("admin-desk");
            } else {
                return res.redirect("teacher-desk");
            }
        });
    })(req, res, next);
});

// Logout
router.get('/logout', ensureCommonAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;