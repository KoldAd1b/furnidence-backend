const createUserPayload = (user) => {
  return {
    id: user._id,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
  };
};
module.exports = createUserPayload;
