const express = require("express");
const router = express.Router();
const {requireLogin} = require("../auth/authGuards.cjs");

const userController = require("../controllers/userController.cjs");

router.post("/login", userController.login);
router.get("/me", requireLogin, userController.getCurrentUser);
router.post("/logout", requireLogin, userController.logout);

module.exports = router;