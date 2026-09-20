const express = require("express");
const router = express.Router();
const attendanceController =
    require("../controllers/attendanceController.cjs");

router.get("/getNextId", attendanceController.getNextId);
router.post("/add", attendanceController.add);
router.get("/getAttendance", attendanceController.getAttendance);

module.exports = router;