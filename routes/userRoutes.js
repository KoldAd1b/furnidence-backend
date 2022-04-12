const express = require("express");
const {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const { restrictByRole } = require("../middleware/authentication");
const router = express.Router();

router.route("/").get(restrictByRole("admin"), getAllUsers);

router.route("/update-user").post(updateUser);

router.route("/user/me").get(getCurrentUser);
router.route("/user/change-password").post(updateUserPassword);

// Always keep optional parameters last
router.route("/:id").get(getSingleUser).patch(updateUser);

module.exports = router;
