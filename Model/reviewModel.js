const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "A review must have a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "A review must have a title"],
      maxLength: 120,
    },
    comment: { type: String, required: [true, "A review must have a comment"] },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
reviewSchema.statics.calcAvgRating = async function (prodId) {
  const stats = this.aggregate([
    { $match: { product: prodId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await this.model("Product").findByIdAndUpdate(prodId, {
      averageRating: stats[0].averageRating,
      totalReviews: stats[0].reviewCount,
    });
  } else {
    await this.model("Product").findByIdAndUpdate(prodId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};
// Ensures that one user can only put in one review per product
reviewSchema.post("save", async function () {
  await this.constructor.calcAvgRating(this.product);
});
reviewSchema.post("remove", async function () {
  await this.constructor.calcAvgRating(this.product);
});
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
module.exports = mongoose.model("Review", reviewSchema);
