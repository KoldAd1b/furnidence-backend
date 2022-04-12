const User = require("../Model/userModel");
const statusCodes = require("http-status-codes").StatusCodes;
const CustomError = require("../errors");
const tokenGenerator = require("../utils/JWT");
const Token = require("../Model/tokenModel");
const { StatusCodes } = require("http-status-codes");
const createPayload = require("../utils/createPayload");
const crypto = require("crypto");
const hashToken = require("../utils/hashToken");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email");

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    throw new CustomError.BadRequestError("Please provide all the details");
  }
  const firstAccount = (await User.countDocuments({})) === 0;
  const role = firstAccount ? "admin" : "user";

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const payload = createPayload(user);

  let refreshToken = crypto.randomBytes(40).toString("hex");

  const userAgent = req.header("user-agent");
  const IP = req.ip;
  const userToken = { refreshToken, IP, userAgent, user: user._id };

  await Token.create(userToken);

  tokenGenerator.sendRequestCookie(res, payload, refreshToken);

  res.status(StatusCodes.CREATED).json({
    status: "Success",
    message: "Thank you for signing up!",
    user,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please Provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user)
    throw new CustomError.UnauthenticatedError(
      "User with that email does not exist"
    );

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword)
    throw new CustomError.UnauthenticatedError("Incorrect Password. Try again");

  const payload = createPayload(user);
  let refreshToken = "";

  const tokenExists = await Token.findOne({ user: user._id });
  if (tokenExists) {
    const { stillValid } = tokenExists;
    if (!stillValid) {
      throw new CustomError.UnauthenticatedError(
        "Your token has expired. Please login"
      );
    }
    refreshToken = tokenExists.refreshToken;

    tokenGenerator.sendRequestCookie(res, payload, refreshToken);

    res.status(statusCodes.ACCEPTED).json({
      status: "Success",
      user: payload,
    });

    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");

  // Accessing headers can be done by req.header() or req.get()
  const userAgent = req.header("user-agent");
  const IP = req.ip;
  const userToken = { refreshToken, IP, userAgent, user: user._id };

  await Token.create(userToken);

  tokenGenerator.sendRequestCookie(res, payload, refreshToken);

  res.status(statusCodes.ACCEPTED).json({
    status: "Success",
    user: payload,
  });
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Missing email field in the body");
  }

  const user = await User.findOne({ email });

  if (!user)
    throw new CustomError.UnauthenticatedError(
      "User with that email does not exist"
    );
  // passwordToken
  // passwordTokenExpiresAt
  // passwordChangedAt
  const origin = process.env.CLIENT_URL;
  const token = crypto.randomBytes(70).toString("hex");

  await sendPasswordResetEmail(
    user.name,
    user.email,
    token,
    origin,
    `${req.protocol}://${req.get("host")}`
  ).catch((err) => {
    throw new CustomError.BadRequestError(
      "Sending email failed. Please try again"
    );
  });

  const passwordExpiresTime = 10 * 60 * 1000;

  user.passwordToken = hashToken(token);
  user.passwordTokenExpiresAt = Date.now() + passwordExpiresTime;

  await user.save();

  res.status(StatusCodes.OK).json({
    status: "Success",
    message:
      "Please check your email for the reset password link. Be sure to check your spam",
  });
};
const resetPassword = async (req, res, next) => {
  const { token, password, email } = req.body;

  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Must provide all values");
  }

  const user = await User.findOne({ email });

  if (user) {
    if (user.passwordToken !== hashToken(token)) {
      throw new CustomError.BadRequestError("Invalid token. Please try again");
    }
    if (user.passwordTokenExpiresAt <= Date.now() - 5000) {
      throw new CustomError.BadRequestError(
        "Your token has expired. Please try again"
      );
    }
    user.passwordToken = null;
    user.passwordTokenExpiresAt = null;
    user.password = password;

    await user.save();
  }

  res.status(StatusCodes.OK).json({
    status: "Success",
    message: "Succesfully updated your password",
  });
};

const sendVerifyEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.BadRequestError(
      "The user with this email does not exist"
    );
  }
  if (user.isVerified) {
    throw new CustomError.BadRequestError(
      "The email has already been verified"
    );
  }

  const verifyToken = crypto.randomBytes(40).toString("hex");
  user.verificationToken = verifyToken;

  await user.save();

  const origin = process.env.CLIENT_URL;

  await sendVerificationEmail(
    user.name,
    user.email,
    verifyToken,
    origin,
    `${req.protocol}://${req.get("host")}`
  ).catch((err) => {
    throw new CustomError.BadRequestError(
      "Sending email failed. Please try again"
    );
  });

  res.status(StatusCodes.OK).json({
    status: "Success",
    message:
      "Verification link sent to your email.Don't forget to check your spam",
  });
};

const verifyEmail = async (req, res, next) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError(
      "User with that email does not exist"
    );
  }

  if (verificationToken !== user.verifyToken) {
    throw new CustomError.UnauthenticatedError("Token does not match the user");
  }

  user.isVerified = true;
  user.verificationDate = Date.now();
  user.verificationToken = "";
  await user.save();

  res.status(StatusCodes.OK).json({
    status: "Success",
    message: "Succesfully verified your email",
  });
};

const logout = async (req, res, next) => {
  await Token.findOneAndDelete({ user: req.user.id });

  res.cookie("accessToken", "Token Removed", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "Token Removed", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({
    status: "Success",
    msg: "User has been logged out",
  });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendVerifyEmail,
};
