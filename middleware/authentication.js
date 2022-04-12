const CustomError = require("../errors");
const { verifyJwt } = require("../utils/JWT");
const Token = require("../Model/tokenModel");
const { sendRequestCookie } = require("../utils/JWT");

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = verifyJwt(accessToken);

      req.user = payload;
      return next();
    }
    const payload = verifyJwt(refreshToken);

    const existingToken = await Token.findOne({
      user: payload.userPayload.id,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.stillValid) {
      throw new CustomError.UnauthenticatedError(
        "Invalid token. Please login or try again"
      );
    }

    sendRequestCookie(res, payload.userPayload, existingToken.refreshToken);

    req.user = payload.userPayload;

    next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError(
      "Invalid token.Please login or try again"
    );
  }
};
const restrictByRole = (...roles) => {
  return (req, res, next) => {
    console.log(next);
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "You are not authorized to view this route"
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  restrictByRole,
};
