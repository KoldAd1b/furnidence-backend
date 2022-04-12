const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Order = require("../Model/orderModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Product = require("../Model/productModel");
const permissonChecker = require("../utils/authorizePermissions");

const getOrders = async (req, res, next) => {
  const orders = await Order.find({});

  res.status(StatusCodes.OK).json({
    orders,
  });
};

const getOrderById = async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order)
    throw new CustomError.BadRequestError(
      "Could not fetch the product. Please try again"
    );

  if (req.user.id !== order.user.toString()) {
    throw new CustomError.UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }

  res.status(StatusCodes.OK).json({
    status: "Success",
    order,
  });
};
const getMyOrders = async (req, res, next) => {
  const { id } = req.user;

  const order = await Order.find({ user: id });

  if (!order)
    throw new CustomError.BadRequestError("You have not issued any orders");

  res.status(StatusCodes.OK).json({
    status: "Succes",
    order,
  });
};
const addOrder = async (req, res, next) => {
  const { items, tax, shippingFee } = req.body;

  if (!items || items.length < 1)
    throw new CustomError.BadRequestError("No cart items found");
  if (!tax || !shippingFee)
    throw new CustomError.BadRequestError(
      "Have to provide tax or shipping fee"
    );

  let orderItems = [];
  let subtotal = 0;

  const products = items.map(async (item) => {
    const product = await Product.findOne({ _id: item._id });
    if (!product)
      throw new CustomError.BadRequestError(
        `The product with id ${item._id} does not exist`
      );
    const { name, price, image, _id } = product;
    const orderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, orderItem];
    subtotal += item.amount * price;
    return Promise.resolve("Successfully created the item");
  });

  await Promise.all(products).then(() => {});

  const total = tax + shippingFee + subtotal;

  // Check order status and user id to see if there is an existing order
  // If there is existing order with same total and order status !== "completed" then only send back the client Secret
  // However if the existing order total is not the same then create the new order and delete the previous order only if the status !== "completed"
  const existingOrder = await Order.findOne({ user: req.user.id });

  if (existingOrder) {
    const existingOrderTotal = existingOrder.total;
    const existingOrderStatus = existingOrder.status;
    if (existingOrderTotal === total && existingOrderStatus !== "completed") {
      return res.status(StatusCodes.OK).json({
        order: existingOrder,
        clientSecret: existingOrder.clientSecret,
      });
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.id,
      });

      await Order.findByIdAndDelete(existingOrder._id);

      res.status(StatusCodes.CREATED).json({
        order,
        clientSecret: order.clientSecret,
      });
    }
  } else {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const order = await Order.create({
      orderItems,
      total,
      subtotal,
      tax,
      shippingFee,
      clientSecret: paymentIntent.client_secret,
      user: req.user.id,
    });

    res.status(StatusCodes.CREATED).json({
      order,
      clientSecret: order.clientSecret,
    });
  }
};

const updateOrder = async (req, res, next) => {
  const { id } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: id });
  if (!order) throw new CustomError.BadRequestError("No order with that ID");

  if (req.user.id !== order.user.toString()) {
    throw new CustomError.UnauthorizedError(
      "You are not authorized to perform this action"
    );
  }
  order.paymentId = paymentIntentId;
  order.status = "completed";

  await order.save();

  res
    .status(StatusCodes.OK)
    .json({ status: "Success", message: "Successfully paid the order" });
};

module.exports = {
  getOrders,
  getOrderById,
  getMyOrders,
  addOrder,
  updateOrder,
};
