const express = require("express");
const router = express.Router();

const classController = require("../controllers/classController.cjs");

router.get("/getClass", classController.getClass);
router.get("/getClassIds", classController.getClassIds);
router.get("/getNextId", classController.getNextId);
router.post("/add", classController.add);

module.exports = router;