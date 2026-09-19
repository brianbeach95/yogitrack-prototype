const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const saleModel = new mongoose.Schema({
    saleId: String,
    customerId: String,
    packageId: String,
    amountPaid: Number,
    paymentMode: String,
    dateTimePaid: Date,
    validityStartDate: Date,
    validityEndDate: Date
}, {collection:"sale"});

module.exports = mongoose.model("Sale", saleModel);