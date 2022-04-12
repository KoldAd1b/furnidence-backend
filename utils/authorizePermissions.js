const CustomError = require("../errors");

const permissonChecker = (user, userId) => {
  if (user.role === "admin") return;
  if (user.id === userId.toString()) return;
  throw new CustomError.UnauthenticatedError("Cannot access this route");
};

module.exports = permissonChecker;
