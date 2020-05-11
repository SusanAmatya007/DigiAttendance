const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const allocationModel = mongoose.model("Allocation");
const teacherModel = mongoose.model("Teacher");
const batchModel = mongoose.model("Batch");

function getAllTeachers(callback) {
    teacherModel.find({ 'role': { $ne: "SuperAdmin" } }).lean().exec((error, docs) => {
        if (!error) {
            return callback(docs);
        } else {
            console.log("Error in retrieving teacher's list : " + error);
        }
    });
}

function getAllBatches(callback) {
    batchModel.find().populate("subjects").lean().exec((error, docs) => {
        if (!error) {
            return callback(docs);
        } else {
            console.log("Error in retrieving teahcer's list : " + error);
        }
    });
}

router.get("/list", (req, res) => {
    allocationModel.find().populate("teacher").populate("batch").populate("subject").lean().exec((error, docs) => {
        if (!error) {
            res.render("allocation/list", {
                list: docs
            });
        } else {
            console.log("Error retrieving allocation's list : " + error);
        }
    });
});

router.get("/getSubjects/batch/:batch_id", (req, res) => {
    batchModel.findById(req.params.batch_id).populate("subjects").lean().exec((error, doc) => {
        if(!error) {
            res.json({batchSubjects : doc.subjects});
        } else {
            console.log("Error fetching subject's list : " + error);
        }
    });
});

router.get("/addOrUpdate", (req, res) => {
    getAllTeachers((teachers) => {
        getAllBatches((batches) => {
            res.render("allocation/addOrUpdate", {
                formTitle: "Teacher Allocation",
                button: "Add",
                icon: "plus",
                teachers : teachers,
                batches: batches,
                scripts : [{script : "/js/custom-subject-renderer.js"}]
            });
        });
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
    allocationModel.findById(req.params.id).lean().exec((error, doc) => {
        if (!error) {
            getAllTeachers((teachers) => {
                getAllBatches((batches) => {
                    res.render("allocation/addOrUpdate", {
                        formTitle: "Update Allocation",
                        allocation: doc,
                        button: "Update",
                        icon: "save",
                        teachers : teachers,
                        batches: batches,
                        scripts : [{script : "/js/custom-subject-renderer.js"}]
                    });
                });
            });
        }
    });
});

function insertRecord(req, res) {
    var allocation = new allocationModel();
    allocation.teacher = req.body.teacher
    allocation.batch = req.body.batch
    allocation.subject = req.body.subject    
    allocation.save((error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                getAllTeachers((teachers) => {
                    getAllBatches((batches) => {
                        res.render("allocation/addOrUpdate", {
                            formTitle: "Teacher Allocation",
                            allocation: req.body,
                            button: "Add",
                            icon: "plus",
                            teachers : teachers,
                            batches: batches,
                            scripts : [{script : "/js/custom-subject-renderer.js"}]
                        });
                    });
                });
            } else {
                console.log("Error while creating a record : " + error);
            }
        }
    });
}

function updateRecord(req, res) {
    allocationModel.updateOne({ _id: req.body._id }, { $set: req.body }, { runValidators: true }, (error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                getAllTeachers((teachers) => {
                    getAllBatches((batches) => {
                        res.render("allocation/addOrUpdate", {
                            formTitle: "Update Allocation",
                            allocation: req.body,
                            button: "Update",
                            icon: "save",
                            teachers : teachers,
                            batches: batches,
                            scripts : [{script : "/js/custom-subject-renderer.js"}]
                        });
                    });
                });
            } else {
                console.log("Error while updating a record : " + error);
            }
        }
    });
}

router.get('/delete/:id', (req, res) => {
    allocationModel.deleteOne({ _id: req.params.id }, (error) => {
        if (!error) {
            res.redirect("/allocation/list");
        }
        else {
            console.log('Error in allocation delete :' + error);
        }
    });
});

function handleValidationError(error, body) {
    for (field in error.errors) {
        switch (error.errors[field].path) {
            case 'teacher':
                body['teacherError'] = error.errors[field].message;
                break;
            case 'batch':
                body['batchError'] = error.errors[field].message;
                break;
            case 'subject':
                body['subjectError'] = error.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;