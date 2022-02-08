const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const logger = require("../helper/adminLogger")
require("dotenv").config();


db.SchoolOperator.belongsTo(db.School, {
    targetKey: "id",
    foreignKey: "schoolId",
});

module.exports = {
    // 1. Get All Active Category
    validateLogin: async (req, res, next) => {
        try {
            const { admin_name, admin_pass, type, logintype } = req.body;

            const password = Buffer.from(admin_pass).toString("base64");

            if (type === "S" && logintype === "G") {
                const { count, rows } = await db.Admin.findAndCountAll({
                    where: {
                        admin_name: admin_name,
                        admin_status: 'Y'
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                if (count > 0) {
                    if (password === rows[0].admin_pass) {
                        const payload = {
                            user: {
                                id: 1,
                                name: rows[0].admin_name,
                                username: rows[0].admin_name,
                                userid: rows[0].admin_id,
                                type: type,
                                status: rows[0].admin_status,
                                logintype: logintype,
                                apiurl: "http://localhost:4003/api",
                                schoolid: 1,
                                schoolname: 'Question Cloud',
                                logo: 'questioncloud.png'
                            },
                        };
                        let token = jwt.sign(payload, "questionCloudSecret", {
                            expiresIn: "24h",
                        });
                        res.set('x-auth-token', token).send({ statusCode: 200, token });
                    } else {
                        res.send({ statusCode: 404, message: "Incorrect password" });
                    }
                } // Create Jwt Payload
                else {
                    if (admin_name == "")
                        res.send({ statusCode: 404, message: "Please Give User ID" });
                    else if (admin_pass == "")
                        res.send({ statusCode: 404, message: "Please Give password" });
                    else res.send({ statusCode: 404, message: "User not found" });
                }
            }
            if (type === "S" && logintype === "I") {
                const { count, rows } = await db.School.findAndCountAll({
                    where: {
                        emailId: admin_name,
                        schoolStatus: 'Y',
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                if (count > 0) {
                    if (password === rows[0].password) {
                        if (new Date(rows[0].expiryDate).getTime() > new Date().getTime()) {
                            const payload = {
                                user: {
                                    id: rows[0].id,
                                    name: rows[0].schoolName,
                                    username: rows[0].emailId,
                                    userid: rows[0].id,
                                    type: type,
                                    status: rows[0].schoolStatus,
                                    logintype: logintype,
                                    apiurl: "http://localhost:4003/api/school",
                                    schoolid: rows[0].id,
                                    schoolname: rows[0].schoolName,
                                    logo: rows[0].schoolLogo
                                }
                            };
                            let token = jwt.sign(payload, "questionCloudSecret", {
                                expiresIn: "24h",
                            });
                            res.set('x-auth-token', token).send({ statusCode: 200, token });
                        } else {
                            res.send({ statusCode: 201, message: "Your Account Expiry!!!" });
                        }
                    } else {
                        res.send({ statusCode: 201, message: "Incorrect Password" });
                    }
                } else {
                    if (admin_name == "")
                        res.send({ statusCode: 201, message: "Please Give User ID" });
                    else if (admin_pass == "")
                        res.send({ statusCode: 201, message: "Please Give password" });
                    else res.send({ statusCode: 404, message: "User not found" });
                }
            }
        } catch (error) {
            logger.error(`Error at Login Admin and School Login : ${error.message}`);
            next(error);
        }
    },

    validateAdminLogin: async (req, res, next) => {
        try {
            const { admin_name, admin_pass, type, logintype } = req.body;
            const password = Buffer.from(admin_pass).toString("base64");
            if (type !== "S" && logintype === "G") {
                const { count, rows } = await db.Operator.findAndCountAll({
                    where: {
                        op_uname: admin_name,
                        op_status: 'Y',
                        op_type: type
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                if (count > 0) {
                    if (password === rows[0].op_password) {
                        const payload = {
                            user: {
                                id: 1,
                                name: rows[0].op_name,
                                username: rows[0].op_uname,
                                userid: rows[0].op_id,
                                type: type,
                                status: rows[0].op_status,
                                logintype: logintype,
                                apiurl: "http://localhost:4003/api",
                                schoolid: 1,
                                schoolname: 'Question Cloud',
                                logo: 'questioncloud.png'
                            },
                        };
                        let token = jwt.sign(payload, "questionCloudSecret", {
                            expiresIn: "24h",
                        });
                        res.set('x-auth-token', token).send({ statusCode: 200, token });
                    } else {
                        res.send({ statusCode: 201, message: "Incorrect Password" });
                    }
                } else {
                    if (admin_name == "")
                        res.send({ statusCode: 201, message: "Please Give User ID" });
                    else if (admin_pass == "")
                        res.send({ statusCode: 201, message: "Please Give password" });
                    else 
                        res.send({ statusCode: 404, message: "User not found" });
                }
            }

            if (type !== "S" && logintype === "I") {
                let where = {
                    op_uname: admin_name,
                    op_status: 'Y',
                }
                type === "A" ? where.op_type = type : '';
                const { count, rows } = await db.SchoolOperator.findAndCountAll({
                    where: where,
                    include: [{ model: db.School }],
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                if (count > 0) {
                    if (password === rows[0].op_password) {
                        if( new Date(rows[0].School.expiryDate).getTime() > new Date().getTime()){
                            const payload = {
                                user: {
                                    id: rows[0].School.id,
                                    name: rows[0].op_name,
                                    username: rows[0].op_uname,
                                    userid: rows[0].op_id,
                                    type: type,
                                    status: rows[0].op_status,
                                    logintype: logintype,
                                    apiurl: "http://localhost:4003/api/school",
                                    schoolid: rows[0].School.id,
                                    schoolname: rows[0].School.schoolName,
                                    logo: rows[0].School.schoolLogo,
                                    master_category_id: rows[0].master_category_id,
                                    main_category_id: rows[0].main_category_id,
                                    sub_category_id: rows[0].sub_category_id,
                                    op_type: rows[0].op_type,
                                    expiryDate: rows[0].expiryDate,
                                },
                            };
                            let token = jwt.sign(payload, "questionCloudSecret", {
                                expiresIn: "24h",
                            });
                            res.set('x-auth-token', token).send({ token });
                        }else{
                            res.send({ statusCode: 201, message: "Your Account Expiry!!!" });
                        }
                    } else {
                        res.send({ statusCode: 201, message: "Incorrect Password" });
                    }
                } else {
                    if (admin_name === "")
                        res.send({ message: "Please Give User ID" });
                    else if (admin_pass === "")
                        res.send({ message: "Please Give password" });
                    else 
                        res.send({ message: "User not found" });
                }
            }
        } catch (error) {
            logger.error(`Error at Admin and Faculty Validate Login : ${error.message}`);
            next(error);
        }
    }
};