const mongoose = require("mongoose");

var batchSchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: "This field is reqiured.",
        index: { unique: true }
    },
    batchName: {
        type: String,
        required: "This field is reqiured."
    },
    batchSection: {
        type: String,
        required: "This field is reqiured."
    },
    batchYear: {
        type: String,
        required: "This field is reqiured."
    },
    subjects : [{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Subject",
    }]
});

module.exports = mongoose.model('Batch', batchSchema);