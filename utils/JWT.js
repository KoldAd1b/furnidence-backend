const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

const createJwt = (payload) => {
  const jsonwebtoken = jwt.sign(payload, secret);
  return jsonwebtoken;
};
const verifyJwt = (token) => {
  const tokenIsValid = jwt.verify(token, secret);
  return tokenIsValid;
};
const sendRequestCookie = (res, userPayload, refreshToken) => {
  const JWTToken = createJwt(userPayload);
  const JWTRefresh = createJwt({ userPayload, refreshToken });

  const expirationTime = 24 * 60 * 60 * 1000;

  res.cookie("accessToken", JWTToken, {
    httpOnly: true,
    maxAge: expirationTime,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  res.cookie("refreshToken", JWTRefresh, {
    httpOnly: true,
    maxAge: expirationTime * 30,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = { createJwt, verifyJwt, sendRequestCookie };
