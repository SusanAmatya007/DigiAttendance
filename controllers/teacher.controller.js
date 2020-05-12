const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const router = express.Router();
const teacherModel = mongoose.model("Teacher");

router.get("/list", (req, res) => {
    teacherModel.find({ 'role': { $ne: "SuperAdmin" } }).lean().exec((error, docs) => {
        if (!error) {
            res.render("teacher/list", {
                list: docs
            });
        } else {
            console.log("Error in retrieving teacher's list : " + error);
        }
    });
});

router.get("/addOrUpdate", (req, res) => {
    res.render("teacher/addOrUpdate", {
        formTitle: "Add Teacher",
        button: "Register",
        icon: "plus"
    });
});

router.post("/addOrUpdate", (req, res) => {
    if (req.body._id == '') {
        insertRecord(req, res);
    } else {
        updateRecord(req, res);
    }
});

router.get("/addOrUpdate/:id", (req, res) => {
    teacherModel.findById(req.params.id).lean().exec((error, doc) => {
        if (!error) {
            res.render("teacher/addOrUpdate", {
                formTitle: "Update Teacher",
                teacher: doc,
                password: doc.password,
                button: "Update",
                icon: "save"
            });
        }
    });
});

function insertRecord(req, res) {
    const { teacherId, fullName, password, mobile, email } = req.body;
    teacherModel.findOne({ teacherId: req.body.teacherId }, (error, doc) => {
        if (!error) {
            if (doc) {
                res.render("teacher/addOrUpdate", {
                    formTitle: "Add Teacher",
                    teacher: req.body,
                    button: "Register",
                    icon: "plus",
                    errorExists: "Teacher ID is already registered."
                });
            } else {
                const newTeacher = new teacherModel({
                    teacherId,
                    fullName,
                    password,
                    mobile,
                    email,
                });
                // Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newTeacher.password, salt, (err, hash) => {
                        if (!err) {
                            // Set Password to hashed
                            newTeacher.password = hash;
                            // Save Teacher
                            newTeacher.save((error, doc) => {
                                if (!error) {
                                    res.redirect("list");
                                } else {
                                    if (error.name == "ValidationError") {
                                        handleValidationError(error, req.body);
                                        res.render("teacher/addOrUpdate", {
                                            formTitle: "Add Teacher",
                                            teacher: req.body,
                                            button: "Register",
                                            icon: "plus"
                                        });
                                    } else {
                                        console.log("Error while creating a record : " + error);
                                    }
                                }
                            });
                        }
                    });
                });
            }
        } else {
            console.log("Error in retrieving teacher : " + error);
        }
    });
}

function updateRecord(req, res) {
    teacherModel.updateOne({ _id: req.body._id }, { $set: req.body }, { runValidators: true }, (error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                res.render("teacher/addOrUpdate", {
                    formTitle: "Update Teacher",
                    teacher: req.body,
                    password: req.body.password,
                    button: "Update",
                    icon: "save"
                });
            } else {
                console.log("Error while updating a record : " + error);
            }
        }
    });
}

router.get('/delete/:teacherId', (req, res) => {
    teacherModel.deleteOne({ teacherId: req.params.teacherId }, (error) => {
        if (!error) {
            res.redirect("/teacher/list");
        }
        else {
            console.log('Error in teacher delete :' + error);
        }
    });
});

function handleValidationError(error, body) {
    for (field in error.errors) {
        switch (error.errors[field].path) {
            case 'teacherId':
                body['teacherIdError'] = error.errors[field].message;
                break;
            case 'fullName':
                body['fullNameError'] = error.errors[field].message;
                break;
            case 'password':
                body['passwordError'] = error.errors[field].message;
                break;
            case 'mobile':
                body['mobileError'] = error.errors[field].message;
                break;
            case 'email':
                body['emailError'] = error.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;