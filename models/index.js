if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const mongoose = require("mongoose");
// const config = require("../config");

// const { database : { host, port, db_name }} = config;
// const database_url = `mongodb://${host}:${port}/${db_name}`;
// const database_url = 'mongodb://127.0.0.1:27017/DigiAttendanceDB'
mongoose.connect(process.env.database_url, {
    useNewUrlParser : true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (error) => {
    if (!error) {
        console.log('MongoDB Connection Successful...');
    } else {
        console.log('Error in DB Connection : ' + error);
    }
});

module.exports = {
    Teacher : require("./teacher.model"),
    Subject : require("./subject.model"),
    Batch : require("./batch.model"),
    Student : require("./student.model"),
    Allocation : require("./allocation.model"),
    Attendance : require("./attendance.model"),
};