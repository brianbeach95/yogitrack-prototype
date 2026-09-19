const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const classModel = new mongoose.Schema({
    classId: String,
    instructorId: String,
    day: String,
    time: String,
    classType: String,
    payRate: Number
}, {collection:"class"});

module.exports = mongoose.model("Class", classModel);