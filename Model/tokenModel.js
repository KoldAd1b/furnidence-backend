const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    IP: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    stillValid: {
      type: Boolean,
      default: true,
    },
    user: {
      ref: "User",
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);
