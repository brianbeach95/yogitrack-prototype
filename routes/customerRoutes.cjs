const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController.cjs");

router.get("/getCustomer", customerController.getCustomer);
router.get("/getNextId", customerController.getNextId);
router.post("/add", customerController.add);
router.get("/getCustomerIds", customerController.getCustomerIds);
router.delete("/deleteCustomer", customerController.deleteCustomer);

module.exports = router;