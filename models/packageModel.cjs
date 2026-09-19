const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const packageModel = new mongoose.Schema({
    packageId: String,
    packageName: String,
    packageCategory: String,
    numberOfClasses: Number,
    classType: String,
    startDate: Date,
    endDate: Date,
    price: Number
}, {collection:"package"});

module.exports = mongoose.model("Package", packageModel);