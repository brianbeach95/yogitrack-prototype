const express = require("express");
const router = express.Router();
const {requireLogin, requireRole} = require("../auth/authGuards.cjs");

const reportController =
    require("../controllers/reportController.cjs");

router.get("/studioPerformance", requireLogin, requireRole("Manager"), reportController.getStudioPerformance);
router.get("/instructorPerformance", requireLogin,reportController.getInstructorPerformance);
router.get("/customerAttendance", requireLogin, requireRole("Manager"), reportController.getCustomerAttendance);
router.get("/classAttendance", requireLogin, reportController.getClassAttendance);
router.get("/customerPackages", requireLogin, requireRole("Manager"), reportController.getCustomerPackages);

module.exports = router;