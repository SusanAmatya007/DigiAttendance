const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const Teacher = require("../models/teacher.model");

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'teacherId' }, (teacherId, password, done) => {
            // Match user
            Teacher.findOne({ teacherId: teacherId }).then(teacher => {
                if (!teacher) {
                    return done(null, false, { errorExists: 'Teacher ID is not registered.' });
                }
                // Match password
                bcrypt.compare(password, teacher.password, (err, isMatch) => {
                    if (err) { 
                        console.log(err); 
                    };
                    if (isMatch) {
                        return done(null, teacher);
                    } else {
                        return done(null, false, { errorExists: 'Password incorrect' });
                    }
                });
            });
        })
    );

    passport.serializeUser((teacher, done) => {
        done(null, teacher.id);
    });

    passport.deserializeUser((id, done) => {
        Teacher.findById(id, function (err, teacher) {
            done(err, teacher);
        });
    });
};