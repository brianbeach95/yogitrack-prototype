const express = require("express");
const router = express.Router();
const {requireLogin, requireRole} = require("../auth/authGuards.cjs");
const instructorController = require("../controllers/instructorController.cjs");

router.get("/getInstructor", instructorController.getInstructor);
router.get("/getNextId", instructorController.getNextId);
router.post("/add", requireLogin, requireRole("Manager"), instructorController.add);
router.get("/getInstructorIds",  instructorController.getInstructorIds);
router.put("/updateInstructor", requireLogin, requireRole("Manager"), instructorController.updateInstructor);
router.delete("/deleteInstructor", requireLogin, requireRole("Manager"), instructorController.deleteInstructor);


module.exports = router;