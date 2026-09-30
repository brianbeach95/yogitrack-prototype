const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController.cjs");
const {requireLogin, requireRole} = require("../auth/authGuards.cjs");

router.get("/getCustomer", requireLogin, customerController.getCustomer);
router.get("/getNextId", requireLogin, requireRole("Manager"), customerController.getNextId);
router.post("/add", requireLogin, requireRole("Manager"), customerController.add);
router.get("/getCustomerIds", requireLogin, customerController.getCustomerIds);
router.put("/updateCustomer",  requireLogin, requireRole("Manager"), customerController.updateCustomer);
router.delete("/deleteCustomer", requireLogin, requireRole("Manager"), customerController.deleteCustomer);

module.exports = router;