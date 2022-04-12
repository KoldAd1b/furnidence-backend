const mongoose = require("mongoose");
const Review = require("./reviewModel");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "A product has to have a name"],
      maxLength: [120, "Name cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "A product has to have a price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "A product must have description"],
      maxLength: [900, "Description should not be more than 900 characters"],
    },
    image: {
      type: String,
      default: "/assets/default-product.jpg",
    },
    images: {
      type: [Object],
    },
    category: {
      type: String,
      required: [true, "A product must have a category"],
      enum: ["office", "kitchen", "bedroom", "living room", "dining", "kids"],
    },
    brand: {
      type: String,
      required: [true, "Please provide company"],
      enum: {
        values: ["ikea", "liddy", "marcos", "caressa"],
        message: "{VALUE} is not supported",
      },
    },
    variants: {
      type: [String],
      required: [true, "Must include variant for a product"],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// Setting it such that can view reviews on product from parent referencing on child
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
  justOne: false,
  //   match:{rating:{$gte:5}} Can set this up to filter the virtual properties
});
productSchema.pre("remove", async function (next) {
  // Can access the model by this.model() or access other models such as this.model("Review").deleteMany()
  await Review.deleteMany({ product: this._id });
  next();
});
module.exports = mongoose.model("Product", productSchema);
