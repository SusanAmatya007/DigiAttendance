const mongoose = require("mongoose");

var subjectSchema = new mongoose.Schema({
    subjectId: {
        type: String,
        required: "This field is reqiured.",
        index: { unique: true }
    },
    subjectName: {
        type: String,
        required: "This field is reqiured."
    }
});

module.exports = mongoose.model('Subject', subjectSchema);