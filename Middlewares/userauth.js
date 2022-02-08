const JWT = require("jsonwebtoken");
const createError = require("http-errors");
require("dotenv").config();
const db = require("../Models");

module.exports = function (req, res, next) {
    /*     //Get token from header
    const token = req.header("x-auth-token") || req.query["x-auth-token"];
    //console.log(token);
    
    //Check if not token
    if (!token) throw createError.Unauthorized("No token, Authorization denied");
    try {
        const decoded = JWT.verify(token, "questionCloudUserSecret");
        req.user = decoded.user;
        next();
    } catch (err) {
        next(err);
        res.status(401).json({ msg: "Token is not valid" });
    } */
    if (!req.headers["x-auth-token"]) return next();
    const token = req.headers["x-auth-token"];
    if (token === null || token === 'null') return next();
    if (!token) return next();
    JWT.verify(token, "questionCloudUserSecret", async (err, payload) => {
        if (err) {
            const message = err.name === "JsonwebTokenError" ? "Unauthorized" : err.message;
            return next(createError.Unauthorized(message));
        }

        /* const { count, rows } = await db.Questions.findAndCountAll({
            where: { stud_id: payload.user.id, logout_flag: 0 },
        });

        if (count == 0) {
            return next(createError.Unauthorized());
        } */

        req.user = payload.user;
        next();
    });
};
