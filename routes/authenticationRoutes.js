const express = require("express");
const authController = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authentication");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.delete("/logout", authenticateUser, authController.logout);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);
router.post("/verify-email", authController.verifyEmail);
router.post(
  "/send-verify-email",
  authenticateUser,
  authController.sendVerifyEmail
);

module.exports = router;
