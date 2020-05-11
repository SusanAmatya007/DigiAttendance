const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const batchModel = mongoose.model("Batch");
const subjectModel = mongoose.model("Subject");

router.get("/list", (req, res) => {
    batchModel.find().populate("subjects").lean().exec((error, docs) => {
        if (!error) {
            docs.forEach((item) => {
                if (item.subjects){
                    item.subjects = item.subjects.map(e=>e.subjectId).join(", ");
                }
            });
            res.render("batch/list", {
                list: docs
            });
        } else {
            console.log("Error in retrieving batch's list : " + error);
        }
    });
});

router.get("/addOrUpdate", (req, res) => {
    subjectModel.find().lean().exec((error, docs) => {
        if (!error) {
            res.render("batch/addOrUpdate", {
                formTitle: "Add Batch",
                button: "Add",
                icon: "plus",
                subjectlist : docs,
                scripts : [{script : "/js/custom-select2.js"}]
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
    batchModel.findById(req.params.id).lean().exec((error, doc) => {
        if (!error) {
            subjectModel.find().lean().exec((error, docs) => {
                if (!error) {
                    res.render("batch/addOrUpdate", {
                        formTitle: "Update Batch",
                        batch: doc,
                        button: "Update",
                        icon: "save",
                        subjectlist : docs,
                        scripts : [{script : "/js/custom-select2.js"}]
                    });
                } else {
                    console.log("Error in retrieving batch's list : " + error);
                }
            });
        }
    });
});

function insertRecord(req, res) {
    var batch = new batchModel();
    batch.batchId = req.body.batchId
    batch.batchName = req.body.batchName
    batch.batchSection = req.body.batchSection
    batch.batchYear = req.body.batchYear
    batch.subjects = req.body.subjects
    batch.save((error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                subjectModel.find().lean().exec((error, docs) => {
                    if (!error) {
                        res.render("batch/addOrUpdate", {
                            formTitle: "Add Batch",
                            batch: req.body,
                            button: "Add",
                            icon: "plus",
                            subjectlist : docs,
                            scripts : [{script : "/js/custom-select2.js"}]
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

function updateRecord (req, res) {
    batchModel.updateOne({ _id: req.body._id }, {$set :req.body}, { runValidators: true }, (error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                subjectModel.find().lean().exec((error, docs) => {
                    if (!error) {
                        res.render("batch/addOrUpdate", {
                            formTitle: "Update Batch",
                            batch: req.body,
                            button: "Update",
                            icon: "save",
                            subjectlist : docs,
                            scripts : [{script : "/js/custom-select2.js"}]
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

router.get('/delete/:batchId', (req, res) => {
    batchModel.deleteOne({ batchId : req.params.batchId }, (error) => {
        if (!error) {
            res.redirect("/batch/list");
        }
        else {
            console.log('Error in batch delete :' + error); 
        }
    });
});

function handleValidationError(error, body) {
    for (field in error.errors) {
        switch (error.errors[field].path) {
            case 'batchId':
                body['batchIdError'] = error.errors[field].message;
                break;
            case 'batchName':
                body['batchNameError'] = error.errors[field].message;
                break;
            case 'batchSection':
                body['batchSectionError'] = error.errors[field].message;
                break;
            case 'batchYear':
                body['batchYearError'] = error.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;