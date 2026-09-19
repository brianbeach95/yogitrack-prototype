const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const instructorModel = new mongoose.Schema({
    instructorId: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    preferredCommunication: {type: String, enum:["Phone", "Email"]}
}, {collection:"instructor"});

module.exports = mongoose.model("Instructor", instructorModel);