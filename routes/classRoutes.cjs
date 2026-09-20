const express = require("express");
const router = express.Router();

const classController = require("../controllers/classController.cjs");

router.get("/getClass", classController.getClass);
router.get("/getClassIds", classController.getClassIds);
router.get("/getNextId", classController.getNextId);
router.post("/add", classController.add);
router.put("/updateClass", classController.updateClass);
router.delete("/deleteClass", classController.deleteClass);
router.get("/getSchedule", classController.getSchedule);

module.exports = router;