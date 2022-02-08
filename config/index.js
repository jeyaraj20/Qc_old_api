const { parsed } = require("dotenv").config();

const ACCESS_SECRET = parsed.ACCESS_SECRET;
const REFRESH_SECRET = parsed.REFRESH_SECRET;

module.exports = { ACCESS_SECRET, REFRESH_SECRET };
