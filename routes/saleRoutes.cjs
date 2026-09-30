const express = require("express");
const router = express.Router();
const {requireLogin, requireRole} = require("../auth/authGuards.cjs");
const saleController = require("../controllers/saleController.cjs");

router.get("/getNextId", saleController.getNextId);
router.post("/add", requireLogin, requireRole("Manager"), saleController.add);

module.exports = router;