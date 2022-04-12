const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: {
    type: "String",
    required: [true, "A user must have a username"],
    minlength: 4,
    maxLength: 55,
  },
  email: {
    type: "String",
    required: [true, "A user must have an email"],
    validate: {
      message: "Invalid email. Please try again",
      validator: validator.isEmail,
    },
    unique: true,
  },
  password: {
    type: "String",
    required: [true, "A user must have password"],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  passwordToken: { type: String },
  passwordTokenExpiresAt: { type: Date },

  verifyToken: {
    type: String,
  },
  isVerified: { type: Boolean, default: false },
  verificationDate: Date,
});

userSchema.pre("save", async function (next) {
  // this.modifiedPaths() return modified fields
  // Can also check for fields using this.modifiedPaths("name")

  if (this.modifiedPaths("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
userSchema.methods.comparePassword = async function (passToCompare) {
  return await bcrypt.compare(passToCompare, this.password);
};

module.exports = mongoose.model("User", userSchema);
