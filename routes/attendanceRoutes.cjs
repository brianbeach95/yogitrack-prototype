const express = require("express");
const router = express.Router();
const {requireLogin} = require("../auth/authGuards.cjs");
const attendanceController = require("../controllers/attendanceController.cjs");

router.get("/getNextId", requireLogin, attendanceController.getNextId);
router.post("/add", requireLogin, attendanceController.add);
router.get("/getAttendance", requireLogin, attendanceController.getAttendance);

module.exports = router;