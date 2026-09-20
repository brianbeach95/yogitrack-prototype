const express = require("express");
const router = express.Router();

const reportController =
    require("../controllers/reportController.cjs");

router.get("/studioPerformance", reportController.getStudioPerformance);
router.get("/instructorPerformance",reportController.getInstructorPerformance);
router.get("/customerAttendance", reportController.getCustomerAttendance);
router.get("/classAttendance", reportController.getClassAttendance);
router.get("/customerPackages", reportController.getCustomerPackages);

module.exports = router;