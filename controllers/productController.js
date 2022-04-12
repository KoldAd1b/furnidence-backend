const path = require("path");

const Product = require("../Model/productModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const getProducts = async (req, res, next) => {
  const products = await Product.find({}).select("-images ");
  res.status(StatusCodes.OK).json({
    status: "Success",
    products,
    count: products.length,
  });
};
const addProduct = async (req, res, next) => {
  const product = await Product.create({
    ...req.body,
    user: req.user.id,
  });

  res.status(StatusCodes.CREATED).json({ status: "Success", product });
};
const getProductById = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("reviews");
  if (!product)
    throw new CustomError.BadRequestError(
      "Could not fetch the product. Please try again"
    );

  res.status(StatusCodes.OK).json({
    status: "Success",
    product,
  });
};

const updateProductById = async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product)
    throw new CustomError.NotFoundError(
      "Could not find any product with the following ID"
    );

  if (req.user.id !== product.user.toString())
    throw new CustomError.UnauthorizedError(
      "You are not authorized to perform actions on this product"
    );

  const updatedProduct = await Product.findByIdAndUpdate(
    product._id,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(StatusCodes.OK).json({
    status: "Success",
    product: updatedProduct,
  });
};
const deleteProductById = async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product)
    throw new CustomError.NotFoundError(
      "Could not find any product with the following ID"
    );

  if (req.user.id !== product.user.toString())
    throw new CustomError.UnauthorizedError(
      "You are not authorized to perform actions on this product"
    );

  await product.remove();
  res.status(StatusCodes.OK).json({
    status: "Success",
    message: "Successfully deleted the product",
  });
};
const uploadProductImage = async (req, res, next) => {
  const { id } = req.params;
  if (!req.files)
    throw new CustomError.BadRequestError(
      "No file provided.Please upload an image"
    );
  const image = req.files.image;
  if (!image.mimetype.startsWith("image"))
    throw new CustomError.BadRequestError("File must be of type image");
  const maxSize = 1024 * 1024;
  if (image.size > maxSize)
    throw new CustomError.BadRequestError("We only accept files less than 1mb");

  const product = await Product.findById(id);
  if (!product)
    throw new CustomError.NotFoundError(
      "Could not find any product with the following ID"
    );

  const imagePath = path.join(__dirname, "../public/assets/" + `${image.name}`);
  await image.mv(imagePath);

  product.image = `/assets/${image.name}`;
  await product.save();

  res
    .status(StatusCodes.OK)
    .json({ status: "Success", image: `/assets/${image.name}` });
};

const getMyProducts = async (req, res, next) => {
  const products = await Product.find({ user: req.user.id });

  res.status(StatusCodes.OK).json({
    status: "Success",
    products: products || [],
  });
};

module.exports = {
  getProducts,
  addProduct,
  getProductById,
  updateProductById,
  deleteProductById,
  uploadProductImage,
  getMyProducts,
};
