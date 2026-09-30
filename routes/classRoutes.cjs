const express = require("express");
const router = express.Router();
const {requireLogin, requireRole} = require("../auth/authGuards.cjs");

const classController = require("../controllers/classController.cjs");

router.get("/getClass", requireLogin, classController.getClass);
router.get("/getClassIds", requireLogin, classController.getClassIds);
router.get("/getNextId", classController.getNextId);
router.post("/add", requireLogin, requireRole("Manager"), classController.add);
router.put("/updateClass", requireLogin, requireRole("Manager"), classController.updateClass);
router.delete("/deleteClass",  requireLogin, requireRole("Manager"), classController.deleteClass);
router.get("/getSchedule", requireLogin, classController.getSchedule);

module.exports = router;