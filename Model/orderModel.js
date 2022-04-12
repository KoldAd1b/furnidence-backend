const mongoose = require("mongoose");
const cartItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Product",
    required: true,
  },
});

const orderSchema = mongoose.Schema(
  {
    tax: {
      type: Number,
      required: [true, "An order must have a tax"],
    },
    shippingFee: {
      type: Number,
      required: [true, "An order must have a shipping fee"],
    },
    subtotal: {
      type: Number,
      required: [true, "An order must have a subtotal"],
    },
    total: {
      type: Number,
      required: [true, "An order must have a total"],
    },
    orderItems: {
      type: [cartItemSchema],
      required: [true, "An order must have items"],
    },
    status: {
      type: String,
      required: [true, "Must specify status"],
      enum: ["completed", "underway", "delayed", "canceled", "failed"],
      default: "underway",
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "Must have a user"],
    },
    clientSecret: {
      type: String,
      required: [true, "Must specify client secret"],
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
