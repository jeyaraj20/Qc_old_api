const JWT = require("jsonwebtoken");
const createError = require("http-errors");
require("dotenv").config();

module.exports = function (req, res, next) {
    //Get token from header
    const token = req.header("x-auth-token") || req.query["x-auth-token"];
    //console.log(token);
    
    //Check if not token
    if (!token) throw createError.Unauthorized("No token, Authorization denied");
    try {
        const decoded = JWT.verify(token, "questionCloudSecret");
        req.user = decoded.user;
        next();
    } catch (err) {
        next(err);
        res.status(401).json({ msg: "Token is not valid" });
    }
};
