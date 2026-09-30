const mongoose = require("../config/mongodbconn.cjs");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["Manager", "Instructor"]
  },
  sourceKey: {
    type: String,
    required: true,
    unique: true
  }
});

const User = mongoose.model(
  "User",
  userSchema,
  "user"
);

module.exports = User;