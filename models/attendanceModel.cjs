const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const attendanceModel = new mongoose.Schema({
    attendanceId: String,
    classId: String,
    customerId: String,
    attendanceDateTime: Date
}, {collection:"attendance"});

module.exports = mongoose.model("Attendance", attendanceModel);