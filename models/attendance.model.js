const mongoose = require("mongoose");

var attendanceSchema = new mongoose.Schema({
    attendanceDate: {
        type: Date,
        required: "This field is reqiured."
    },
    allocation : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Allocation",
        required : "This field is required."
    },
    student : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Student",
        required : "This field is required."
    },
    attendanceStatus : {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Attendance', attendanceSchema);