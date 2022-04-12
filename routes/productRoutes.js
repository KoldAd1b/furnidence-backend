const express = require("express");
const router = express.Router();
const {
  getProducts,
  addProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  uploadProductImage,
  getMyProducts,
} = require("../controllers/productController");
const { restrictByRole } = require("../middleware/authentication");
const { authenticateUser } = require("../middleware/authentication");

router
  .route("/")
  .get(getProducts)
  .post(authenticateUser, restrictByRole("admin"), addProduct);

router.get(
  "/my-products",
  authenticateUser,
  restrictByRole("admin"),
  getMyProducts
);
router
  .route("/:id")
  .get(getProductById)
  .patch(authenticateUser, restrictByRole("admin"), updateProductById)
  .delete(authenticateUser, restrictByRole("admin"), deleteProductById);

router
  .route("/:id/upload-image")
  .post(authenticateUser, restrictByRole("admin"), uploadProductImage);

module.exports = router;
