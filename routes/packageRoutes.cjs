const express = require("express");
const router = express.Router();
const {requireLogin, requireRole} = require("../auth/authGuards.cjs");

const packageController = require("../controllers/packageController.cjs");

router.get("/getPackage", requireLogin, requireRole("Manager"), packageController.getPackage);
router.get("/getPackageIds", requireLogin, requireRole("Manager"), packageController.getPackageIds);
router.get("/getNextId", requireLogin, requireRole("Manager"), packageController.getNextId);
router.post("/add", requireLogin, requireRole("Manager"), packageController.add);
router.put("/updatePackage", requireLogin, requireRole("Manager"), packageController.updatePackage);
router.delete("/deletePackage", requireLogin, requireRole("Manager"), packageController.deletePackage);

module.exports = router;