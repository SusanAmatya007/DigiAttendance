const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const studentModel = mongoose.model("Student");
const batchModel = mongoose.model("Batch");

router.get("/list", (req, res) => {
    studentModel.find().populate("batch").lean().exec((error, docs) => {
        if (!error) {
            docs.forEach(student => student.dateOfBirth = student.dateOfBirth.toISOString().split("T")[0]);
            res.render("student/list", {
                list: docs
            });
        } else {
            console.log("Error in retrieving student's list : " + error);
        }
    });
});

router.get("/addOrUpdate", (req, res) => {
    batchModel.find().lean().exec((error, docs) => {
        if (!error) {
            res.render("student/addOrUpdate", {
                formTitle: "Add Student",
                button: "Add",
                icon: "plus",
                batchlist: docs,
                scripts : [{script : "/js/custom-datepicker.js"}]
            });
        } else {
            console.log("Error in retrieving batch's list : " + error);
        }
    });
});

router.post("/addOrUpdate", (req, res) => {
    if (req.body._id == '') {
        insertRecord(req, res);
    }
    else {
        updateRecord(req, res);
    }
});

router.get("/addOrUpdate/:id", (req, res) => {
    studentModel.findById(req.params.id).lean().exec((error, doc) => {
        if (!error) {
            doc.dateOfBirth = doc.dateOfBirth.toISOString().split("T")[0];
            batchModel.find().lean().exec((error, docs) => {
                if (!error) {
                    res.render("student/addOrUpdate", {
                        formTitle: "Update Student",
                        student: doc,
                        button: "Update",
                        icon: "save",
                        batchlist: docs,
                        scripts : [{script : "/js/custom-datepicker.js"}]
                    });
                } else {
                    console.log("Error in retrieving batch's list : " + error);
                }
            });
        }
    });
});

function insertRecord(req, res) {
    var student = new studentModel();
    student.studentId = req.body.studentId
    student.studentName = req.body.studentName
    student.mobile = req.body.mobile
    student.email = req.body.email
    student.dateOfBirth = req.body.dateOfBirth
    student.batch = req.body.batch
    student.save((error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                batchModel.find().lean().exec((error, docs) => {
                    if (!error) {
                        res.render("student/addOrUpdate", {
                            formTitle: "Add Student",
                            student: req.body,
                            button: "Add",
                            icon: "plus",
                            batchlist: docs,
                            scripts : [{script : "/js/custom-datepicker.js"}]
                        });
                    } else {
                        console.log("Error in retrieving batch's list : " + error);
                    }
                });
            } else {
                console.log("Error while creating a record : " + error);
            }
        }
    });
}

function updateRecord(req, res) {
    studentModel.updateOne({ _id: req.body._id }, { $set: req.body }, { runValidators: true }, (error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                batchModel.find().lean().exec((error, docs) => {
                    if (!error) {
                        res.render("student/addOrUpdate", {
                            formTitle: "Update Student",
                            student: req.body,
                            button: "Update",
                            icon: "save",
                            batchlist: docs,
                            scripts : [{script : "/js/custom-datepicker.js"}]
                        });
                    } else {
                        console.log("Error in retrieving batch's list : " + error);
                    }
                });
            } else {
                console.log("Error while updating a record : " + error);
            }
        }
    });
}

router.get('/delete/:studentId', (req, res) => {
    studentModel.deleteOne({ studentId: req.params.studentId }, (error) => {
        if (!error) {
            res.redirect("/student/list");
        }
        else {
            console.log('Error in student delete :' + error);
        }
    });
});

function handleValidationError(error, body) {
    for (field in error.errors) {
        switch (error.errors[field].path) {
            case 'studentId':
                body['studentIdError'] = error.errors[field].message;
                break;
            case 'studentName':
                body['studentNameError'] = error.errors[field].message;
                break;
            case 'mobile':
                body['mobileError'] = error.errors[field].message;
                break;
            case 'email':
                body['emailError'] = error.errors[field].message;
                break;
            case 'dateOfBirth':
                body['dateOfBirthError'] = error.errors[field].message;
                break;
            case 'batch':
                body['batchError'] = error.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;