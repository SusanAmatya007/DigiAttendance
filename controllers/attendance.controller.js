const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const handlebars = require("handlebars");
const path = require("path");

const router = express.Router();
const allocationModel = mongoose.model("Allocation");
const attendanceModel = mongoose.model("Attendance");
const studentModel = mongoose.model("Student");

const compile = async function(data) {
    const filePath = path.join(process.cwd(), 'views/attendance', 'studentSubjectAttendance.hbs');
    const html = await fs.readFile(filePath, "utf-8");
    console.log(filePath)
    return handlebars.compile(html)(data);
}

async function printPDF(data) {
    try {
        const browser = await puppeteer.launch({headless:true});
        const page = await browser.newPage();
        const content = await compile(data)
        await page.setContent(content);
        await page.addStyleTag({url : "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"});
        await page.emulateMedia("screen");
        const pdf = await page.pdf({
            format : "A4",
            printBackground : true,
            margin : {
                top : "0.5cm",
                bottom : "0.5cm",
                left: "0.5cm",
                right :  "0.5cm"
            }
        });
        await browser.close();
        return pdf;
    } catch (e) {
        console.log("Error generating pdf : " + e);
    }
}

router.get("/home", (req, res) => {
    var teacher_id = req.user._id;
    allocationModel.find({teacher:teacher_id}).populate("teacher").populate("batch").populate("subject").lean().exec((error, docs) => {
        if (!error) {
            res.render("attendance/home", {
                list: docs
            });
        } else {
            console.log("Error retrieving allocation's list : " + error);
        }
    });
});

router.get("/batch/:id", (req, res) => {
    allocationModel.findById(req.params.id).populate("teacher").populate("batch").populate("subject").lean().exec((error, allocation_doc) => {
        studentModel.find({batch:allocation_doc.batch._id}).lean().exec((error, student_docs) => {
            attendanceModel.find({allocation:req.params.id}).lean().exec((error, attendance_docs) => {
                var group_to_values = attendance_docs.reduce((obj, item) => {
                    obj[item.student] = obj[item.student] || [];
                    obj[item.student].push(item.attendanceStatus);
                    return obj;
                }, {});
                
                var studentAttDetails = Object.keys(group_to_values).map((key) => {
                    return {_id: mongoose.Types.ObjectId(key), attendanceStatus: group_to_values[key]};
                });
                studentAttDetails.forEach((item) => {
                    item["totalPresent"] = item.attendanceStatus.filter(v=>v).length;
                    item["totalWorkingDays"] = item.attendanceStatus.length
                });
                var student_docs_new = student_docs.map(itm => ({
                    ...studentAttDetails.find((item) => (item._id.toString() === itm._id.toString()) && item),
                    ...itm
                }));
                if(!error) {  
                    res.render("attendance/studentBatchList", {
                        allocation : allocation_doc,
                        studentList : student_docs_new,
                        scripts : [{script : "/js/custom-datepicker-attendance-list.js"}]
                    });
                } else {
                    console.log("Error fetching subject's list : " + error);
                }
            });
        });
    });
});

router.get("/conduct/:id", (req, res) => {
    allocationModel.findById(req.params.id).populate("teacher").populate("batch").populate("subject").lean().exec((error, allocation_doc) => {
        studentModel.find({batch:allocation_doc.batch._id}).lean().exec((error, docs) => {
            if(!error) {
                res.render("attendance/studentBatchAttendance", {
                    allocation : allocation_doc,
                    studentList : docs,
                    scripts : [{script : "/js/custom-datepicker-attendance.js"}]
                });
            } else {
                console.log("Error fetching subject's list : " + error);
            }
        });
    });
});

router.post("/conduct/:id", (req, res) => {
    var studentAttendanceStatus = JSON.parse(req.body.studentAttendanceStatus);
    var studentAttendanceArray = new Array();
    studentAttendanceStatus.forEach((item)=>{
        var attendance = new attendanceModel();
        attendance.attendanceDate = req.body.attendanceDate;
        attendance.allocation = req.body.allocation;
        attendance.student = item.student_id;
        attendance.attendanceStatus = item.status;
        studentAttendanceArray.push(attendance);
    });
    attendanceModel.insertMany(studentAttendanceArray, (error, docs) => {
        if (!error) {
            res.redirect("/attendance/home");
        } else {
            console.log("Error creating attendance record : " + error);
        }
    });
});

router.post("/getSubjectAttendance", (req, res) => {
    attendanceModel.find({allocation:req.body.allocation_id , attendanceDate : new Date(req.body.attendanceDate)}).lean().exec((error, docs)=>{
        if (!error) {
            var totalStrength = docs.length
            var totalPresent = 0;
            docs.forEach((item) => {
                if (item.attendanceStatus) {
                    totalPresent += 1;
                }
            });
            res.send({
                attendanceDate : req.body.attendanceDate,
                attendancePresent : totalPresent,
                attendanceTotalStrength : totalStrength
            });
        }
    });
});

function getStudentSubjectDetails(student_id, allocation_id, callback) {
    attendanceModel.find({ student:student_id, allocation:allocation_id }).populate("student").populate({path:"allocation", model:"Allocation", populate : [{ path:"batch", model:"Batch" },{ path:"subject", model:"Subject" }]}).lean().exec((error, docs) => {
        if(!error) {
            if (docs.length !=0) {
                var student = docs[0].student;
                student.dateOfBirth = student.dateOfBirth.toISOString().split("T")[0];
                var subject = docs[0].allocation.subject;
                var batch = docs[0].allocation.batch;
            }
            var totalWorkingDays = docs.length
            var totalPresent = 0;
            var attendanceArray = []
            docs.forEach((item)=>{
                if (item.attendanceStatus) {
                    totalPresent += 1;
                }
                attendanceArray.push({
                    attendanceDate : item.attendanceDate.toISOString().split("T")[0],
                    attendanceStatus : ((item.attendanceStatus) ? "Present" : "Absent")
                });
            });
            var totalPercentAttendance = ((totalPresent * 100.0) / totalWorkingDays);
            var details = {
                fileName : student.studentName + "-" + student.studentId + "-" + batch.batchId + "-" + subject.subjectId + "_" + new Date().toISOString().split("T")[0] + ".pdf",
                student : student,
                batch : batch,
                subject : subject,
                totalWorkingDays : totalWorkingDays,
                totalPresent : totalPresent,
                totalPercentAttendance : totalPercentAttendance,
                attendanceArray : attendanceArray
            };
            return callback(details);
        } else {
            console.log("Error fetching attendance details : " + error);
        }
    });
}

router.get("/getStudentSubjectAttendance/student/:student_id/allocation/:allocation_id", (req, res) => {
    getStudentSubjectDetails(req.params.student_id,req.params.allocation_id,(details)=>{
        res.render("attendance/studentSubjectAttendance", details);
    });
});

router.get("/downloadStudentSubjectAttendance/student/:student_id/allocation/:allocation_id", (req,res)=>{
    getStudentSubjectDetails(req.params.student_id,req.params.allocation_id,async (details)=>{
        const pdf =  await printPDF(details);
        res.set({'Content-Type': 'application/pdf', 'Content-Length': pdf.length, 'filename': details.fileName });
        res.send(pdf);
    });
});

module.exports = router;