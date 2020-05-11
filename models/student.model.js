const mongoose = require("mongoose");

var studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: "This field is reqiured.",
        index: { unique: true }
    },
    studentName: {
        type: String,
        required: "This field is reqiured."
    },
    mobile: {
        type: String,
        required: "This field is reqiured."
    },
    email: {
        type: String,
        required: "This field is reqiured."
    },
    dateOfBirth: {
        type: Date,
        required: "This field is reqiured."
    },
    batch : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Batch",
        required: "This field is required."
    }    
});

// Custom validation for email
studentSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Custom validation for mobile
// studentSchema.path('mobile').validate((val) => {
//     mobileRegex = /^(\+1\-)([0-9]{3})(\-)[\0-9]{3}(\-)[0-9]{4}$/;
//     return mobileRegex.test(val);
// }, 'Invalid. eg.- +1-xxx-xxx-xxxx');

module.exports = mongoose.model('Student', studentSchema);