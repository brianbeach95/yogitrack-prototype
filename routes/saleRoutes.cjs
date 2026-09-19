const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController.cjs");

router.get("/getNextId", saleController.getNextId);
router.post("/add", saleController.add);

module.exports = router;