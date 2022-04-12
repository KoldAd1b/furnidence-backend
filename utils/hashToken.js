const crypto = require("crypto");

const hash = (token) => crypto.createHash("md5").update(token).digest("hex");

module.exports = hash;
