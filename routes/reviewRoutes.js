const express = require("express");
const router = express.Router();
const {
  addReview,
  getReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
  getReviewsByProduct,
} = require("../controllers/reviewController");
const { authenticateUser } = require("../middleware/authentication");
const { restrictByRole } = require("../middleware/authentication");
router.route("/").get(getReviews).post(authenticateUser, addReview);

router
  .route("/:id")
  .get(getReviewById)
  .patch(authenticateUser, updateReviewById)
  .delete(authenticateUser, deleteReviewById);

router.route("/product/:id").get(getReviewsByProduct);

module.exports = router;
