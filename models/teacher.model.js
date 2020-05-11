const mongoose = require("mongoose");

var teacherSchema = new mongoose.Schema({
    teacherId: {
        type: String,
        required: "This field is reqiured.",
        index: { unique: true }
    },
    fullName: {
        type: String,
        required: "This field is reqiured."
    },
    password: {
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
    role: {
        type: String,
        required: "This field is reqiured.",
        default: "Teacher"
    }
});

// Custom validation for email
teacherSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Custom validation for mobile
// teacherSchema.path('mobile').validate((val) => {
//     mobileRegex = /^(\+1\-)([0-9]{3})(\-)[\0-9]{3}(\-)[0-9]{4}$/;
//     return mobileRegex.test(val);
// }, 'Invalid. eg.- +1-xxx-xxx-xxxx');

module.exports = mongoose.model('Teacher', teacherSchema);