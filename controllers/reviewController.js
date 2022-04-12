const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Product = require("../Model/productModel");
const permissonChecker = require("../utils/authorizePermissions");
const Review = require("../Model/reviewModel");
const addReview = async (req, res, next) => {
  const { product: prodId, ...rest } = req.body;
  if (!prodId)
    throw new CustomError.BadRequestError(
      "Cannot add review without the product"
    );
  const product = await Product.findById(prodId);
  if (!product)
    throw new CustomError.NotFoundError(
      "The product for which you requested a review does not exist"
    );
  const review = await Review.create({
    ...rest,
    product: prodId,
    user: req.user.id,
  });
  res.status(StatusCodes.CREATED).json({
    status: "Success",
    review,
  });
};

const getReviews = async (req, res, next) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name brand price",
  });
  res.status(StatusCodes.OK).json({
    status: "Success",
    reviews,
  });
};
const getReviewById = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review)
    throw new CustomError.NotFoundError("No such review in the database");
  res.status(StatusCodes.OK).json({
    status: "Success",
    review,
  });
};
const updateReviewById = async (req, res, next) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findById(id);
  if (!review)
    throw new CustomError.NotFoundError("No such review in the database");

  permissonChecker(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({
    status: "Success",
    message: "Succesfully updated the review",
  });
};
const deleteReviewById = async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review)
    throw new CustomError.NotFoundError("No such review in the database");
  permissonChecker(req.user, review.user);

  await review.remove();

  res.status(StatusCodes.OK).json({
    status: "Success",
    message: "Successfully deleted the review",
  });
};
getReviewsByProduct = async (req, res, next) => {
  const { id: prodId } = req.params;

  const reviews = await Review.find({ product: prodId }).populate({
    path: "user",
    select: "name _id",
  });
  if (!reviews.length > 1)
    throw new CustomError.NotFoundError(
      "No reviews found for the following product"
    );
  res.status(StatusCodes.OK).json({
    status: "Success",
    reviews,
  });
};

module.exports = {
  addReview,
  getReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
  getReviewsByProduct,
};
