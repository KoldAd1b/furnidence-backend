const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const User = require("../Model/userModel");
const { sendRequestCookie } = require("../utils/JWT");
const createPayload = require("../utils/createPayload");
const permissonChecker = require("../utils/authorizePermissions");
const fieldLimiter = (obj, ...fieldsToDelete) => {
  fieldsToDelete.forEach((el, i) => delete obj[el]);
  return obj;
};

const getAllUsers = async (req, res, next) => {
  const users = await User.find({ role: "user" }).select("-password");
  if (!users)
    throw new CustomError.BadRequestError(
      "Could not fetch all users, please try again"
    );

  res.status(StatusCodes.OK).json({
    status: "Success",
    users,
  });
};
const getSingleUser = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user)
    throw new CustomError.NotFoundError(
      "Could not find the user with the following id"
    );
  permissonChecker(req.user, user._id);
  res.status(StatusCodes.OK).json({
    status: "Success",
    user,
  });
};

const getCurrentUser = async (req, res, next) => {
  if (req.user) {
    const foundUser = await User.findById(req.user.id);

    const user = createPayload(foundUser);
    return res.status(StatusCodes.OK).json({ status: "Success", user });
  }
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ status: "Failed", message: "No user logged in currently" });
};

const updateUser = async (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email)
    throw new CustomError.BadRequestError("Must provide both email and name");
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      email,
    },
    { new: true, runValidators: true }
  );

  const payload = createPayload(user);
  sendRequestCookie(res, payload);

  res.status(StatusCodes.OK).json({
    status: "Success",
    user: payload,
  });
};
const updateUserPassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new CustomError.BadRequestError(
      "Both old password and new password is required"
    );

  const user = await User.findById(req.user.id);
  if (!user)
    throw new CustomError.NotFoundError(
      "Could not find the user with the following id"
    );
  const passwordDifferent = await user.comparePassword(oldPassword);

  if (!passwordDifferent)
    throw new CustomError.UnauthenticatedError(
      "Cannot change the password without the old one"
    );

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({
    status: "Success",
    user,
  });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
};
