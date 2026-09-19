const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const customerModel = new mongoose.Schema({
    customerId: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    preferredCommunication: {type: String, enum:["Phone", "Email"]},
    classBalance: {type: Number, default: 0}
}, {collection:"customer"});

module.exports = mongoose.model("Customer", customerModel);