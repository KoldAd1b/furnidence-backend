const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrderById,
  getMyOrders,
  addOrder,
  updateOrder,
} = require("../controllers/orderController");
const { restrictByRole } = require("../middleware/authentication");
const { authenticateUser } = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUser, restrictByRole("admin"), getOrders)
  .post(authenticateUser, addOrder);

router.route("/my-orders").post(authenticateUser, getMyOrders);

router
  .route("/:id")
  .get(authenticateUser, getOrderById)
  .patch(authenticateUser, updateOrder);

module.exports = router;
