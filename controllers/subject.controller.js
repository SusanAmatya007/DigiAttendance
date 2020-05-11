const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const subjectModel = mongoose.model("Subject");

router.get("/list", (req, res) => {
    subjectModel.find().lean().exec((error, docs) => {
        if (!error) {
            res.render("subject/list", {
                list: docs
            });
        } else {
            console.log("Error in retrieving subject's list : " + error);
        }
    });
});

router.get("/addOrUpdate", (req, res) => {
    res.render("subject/addOrUpdate", {
        formTitle: "Add Subject",
        button: "Add",
        icon: "plus"
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
    subjectModel.findById(req.params.id).lean().exec((error, doc) => {
        if (!error) {
            res.render("subject/addOrUpdate", {
                formTitle: "Update Subject",
                subject: doc,
                button: "Update",
                icon: "save"
            });
        }
    });
});

function insertRecord(req, res) {
    var subject = new subjectModel();
    subject.subjectId = req.body.subjectId
    subject.subjectName = req.body.subjectName
    subject.save((error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                res.render("subject/addOrUpdate", {
                    formTitle: "Add Subject",
                    subject: req.body,
                    button: "Add",
                    icon: "plus"
                });
            } else {
                console.log("Error while creating a record : " + error);
            }
        }
    });
}

function updateRecord (req, res) {
    subjectModel.updateOne({ _id: req.body._id }, {$set :req.body}, { runValidators: true }, (error, doc) => {
        if (!error) {
            res.redirect("list");
        } else {
            if (error.name == "ValidationError") {
                handleValidationError(error, req.body);
                res.render("subject/addOrUpdate", {
                    formTitle: "Update Subject",
                    subject: req.body,
                    button: "Update",
                    icon: "save"
                });
            } else {
                console.log("Error while updating a record : " + error);
            }
        }
    });
}

router.get('/delete/:subjectId', (req, res) => {
    subjectModel.deleteOne({ subjectId : req.params.subjectId }, (error) => {
        if (!error) {
            res.redirect("/subject/list");
        }
        else {
            console.log('Error in subject delete :' + error); 
        }
    });
});

function handleValidationError(error, body) {
    for (field in error.errors) {
        switch (error.errors[field].path) {
            case 'subjectId':
                body['subjectIdError'] = error.errors[field].message;
                break;
            case 'subjectName':
                body['subjectNameError'] = error.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;