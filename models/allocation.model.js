const mongoose = require("mongoose");

var allocationSchema = new mongoose.Schema({
    teacher : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Teacher",
        required : "This field is required."
    },
    subject : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Subject",
        required : "This field is required."
    },
    batch : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Batch",
        required : "This field is required."
    }
});

module.exports = mongoose.model('Allocation', allocationSchema);