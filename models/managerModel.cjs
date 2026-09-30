const mongoose = require("../config/mongodbconn.cjs");

const managerSchema = new mongoose.Schema({
  managerId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  address:String,
  phone: String,
  email: String
});

const Manager = mongoose.model(
  "Manager",
  managerSchema,
  "manager"
);

module.exports = Manager;