const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const { ACCESS_SECRET, REFRESH_SECRET } = require("../config");

module.exports = {
    //  1. Sign Access Token (Create Token)
    signAccessToken: (payloadData) => {
        return new Promise((resolve, reject) => {
            const payload = payloadData;
            const secret = ACCESS_SECRET;
            const options = {
                expiresIn: "1h",
                issuer: "cloudb.com",
                audience: payloadData.user.email,
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    reject(createError.InternalServerError());
                }
                resolve(token);
            });
        });
    },

    // 2. Verify Access Token, Valid or Not
    verifyAccessToken: (req, res, next) => {
        if (!req.headers["x-auth-token"]) return next(createError.Unauthorized());
        const token = req.headers["x-auth-token"];
        JWT.verify(token, ACCESS_SECRET, (err, payload) => {
            if (err) {
                const message = err.name === "JsonwebTokenError" ? "Unauthorized" : err.message;
                return next(createError.Unauthorized(message));
            }
            req.payload = payload;
            next();
        });
    },

    //  3. Sign Refresh Token (Create Token)
    signRefreshToken: (payloadData) => {
        return new Promise((resolve, reject) => {
            const payload = payloadData;
            const secret = REFRESH_SECRET;
            const options = {
                expiresIn: "1y",
                issuer: "cloudb.com",
                audience: payloadData.user.email,
            };
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    reject(createError.InternalServerError());
                }
                resolve(token);
            });
        });
    },

    // 4. Verify Refresh Token, Valid or Not
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, REFRESH_SECRET, (err, payload) => {
                if (err) reject(createError.Unauthorized());
                const payloadData = {
                    user: {
                        id: payload.user.id,
                        name: payload.user.name,
                        email: payload.user.email,
                        regno: payload.user.regno,
                        type: payload.user.type,
                        status: payload.user.status,
                        mobile: payload.user.mobile,
                        schoolId: payload.user.schoolId,
                        mastercatid: payload.user.mastercatid,
                    },
                };
                resolve(payloadData);
            });
        });
    },
};
