const db = require("../../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const logger = require("../../helper/userLogger");
const {
    ImageFilter,
    SendOtpMail,
    SendOtpSms,
    SendPasswordMail,
    SendForgotPasswordSms,
} = require("../../helper/general_helper");
require("dotenv").config();
const {
    verifyRefreshToken,
    verifyAccessToken,
    signAccessToken,
    signRefreshToken,
} = require("../../helper/jwt_helper");

db.SchoolOperator.belongsTo(db.School, {
    targetKey: "id",
    foreignKey: "schoolId",
});

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var profilesDir = path.join(process.env.userProfile);
fs.existsSync(profilesDir) || fs.mkdirSync(profilesDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.userProfile);
    },
    filename: (req, file, callBack) => {
        let usertype = req.user.type;
        let userid = req.user.id;
        callBack(null, `file-${usertype}-${userid}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: ImageFilter,
    limits: { fileSize: "2mb" },
}).fields([
    {
        name: "stud_image",
        maxCount: 1,
    },
]);

//-------------------------- Multer Part End ---------------------------------------//

module.exports = {
    // 1. Get All Active Category
    validateLogin: async (req, res, next) => {
        try {
            const { stud_email, stud_pass, user_ip, mobileFlag, logintype } = req.body;

            const password = Buffer.from(stud_pass).toString("base64");
            let logindataschool, logindata;

            if(logintype === 'Institution' ){
                logindataschool = await db.SchoolStudent.findAndCountAll({
                    where: {
                        stud_email: stud_email,
                        // stud_pass: password,
                        stud_status: "Y",
                    },
                });
            }else{
                logindata = await db.Student.findAndCountAll({
                    where: {
                        stud_email: stud_email,
                        // stud_pass: password,
                        stud_status: "Y",
                    },
                });
            }

            if (logindata && logindata.count > 0) {
                if (logindata.rows[0].stud_pass == password) {
                    const payload = {
                        user: {
                            id: logindata.rows[0].stud_id,
                            name: logindata.rows[0].stud_fname,
                            email: logindata.rows[0].stud_email,
                            regno: logindata.rows[0].stud_regno,
                            type: "G",
                            status: logindata.rows[0].stud_status,
                            mobile: logindata.rows[0].stud_mobile,
                            schoolId: 0,
                            mastercatid: 0,
                        },
                    };
                    let token = jwt.sign(payload, "questionCloudUserSecret", {
                        expiresIn: "24h",
                    });
                    console.log(token);
                    const [cartitem, created] = await db.UserLogin.findOrCreate({
                        where: { stud_id: logindata.rows[0].stud_id, logout_flag: 0, mobile_flag: 0 },
                        defaults: {
                            stud_id: logindata.rows[0].stud_id,
                            user_name: stud_email,
                            logged_out: 0,
                            logged_in_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            logged_out_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            ip_address: user_ip,
                            token_id: 0,
                            token_secret: token,
                            token_deleted: 0,
                            device: 'Test',
                            logout_flag: 0,
                            mobile_flag: mobileFlag ? mobileFlag : 0 
                        },
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                    if (created) {
                        let refreshToken = await signRefreshToken(payload);
                        res.set("x-auth-token", token).send({ token, refreshToken });
                    } else {
                        if (stud_email && stud_pass) {
                            const { count, rows } = await db.UserLogin.findAndCountAll({
                                where: {
                                    user_name: stud_email,
                                    logout_flag: 0,
                                },
                                order: [["user_login_id"]],
                            });

                            if (!rows) {
                                throw createError.NotFound("Items not found.");
                            }
                            res.send({ count, loggeddetails: rows, user_name: rows[0].user_name, message: "Already logged in other device" });
                            //res.send({ message: "Already logged in other device" });
                        }
                    }
                } else {
                    res.send({ message: "Password Wrong" });
                }
            } else if (logindataschool && logindataschool.count > 0) {
                if (logindataschool.rows[0].stud_pass == password) {
                    const payload = {
                        user: {
                            id: logindataschool.rows[0].stud_id,
                            name: logindataschool.rows[0].stud_fname,
                            email: logindataschool.rows[0].stud_email,
                            regno: logindataschool.rows[0].stud_regno,
                            type: "S",
                            status: logindataschool.rows[0].stud_status,
                            mobile: logindataschool.rows[0].stud_mobile,
                            schoolId: logindataschool.rows[0].school_id,
                            mastercatid: logindataschool.rows[0].category_id,
                        },
                    };
                    let token = jwt.sign(payload, "questionCloudUserSecret", {
                        expiresIn: "24h",
                    });
                    console.log(token);
                    const [cartitem, created] = await db.UserLogin.findOrCreate({
                        where: { stud_id: logindataschool.rows[0].stud_id, logout_flag: 0, mobile_flag: 0 },
                        defaults: {
                            stud_id: logindataschool.rows[0].stud_id,
                            user_name: stud_email,
                            logged_out: 0,
                            logged_in_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            logged_out_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            ip_address: user_ip,
                            token_id: 0,
                            token_secret: token,
                            token_deleted: 0,
                            device: 'Test',
                            logout_flag: 0,
                            mobile_flag: mobileFlag ? mobileFlag : 0 
                        },
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                    if (created) {
                        let refreshToken = await signRefreshToken(payload);
                        res.set("x-auth-token", token).send({ token, refreshToken });
                    } else {
                        if (stud_email && stud_pass) {
                            const { count, rows } = await db.UserLogin.findAndCountAll({
                                where: {
                                    user_name: stud_email,
                                    logout_flag: 0,
                                },
                                order: [["user_login_id"]],
                            });

                            if (!rows) {
                                throw createError.NotFound("Items not found.");
                            }
                            res.send({ count, loggeddetails: rows, user_name: rows[0].user_name, message: "Already logged in other device" });
                            //res.send({ message: "Already logged in other device" });
                        }
                    }
                } else {
                    res.send({ message: "Password Wrong" });
                }
            } else {
                if (stud_email == "") res.send({ message: "Please give email-id" });
                else if (stud_pass == "") res.send({ message: "Please give password" });
                else res.send({ message: "User not found" });
            }
        } catch (error) {
            logger.error(`Error at User Login Validate : ${error.message}`);
            next(error);
        }
    },

    // 2. Signup User
    signupStudent: async (req, res, next) => {
        try {
            const { stud_fname, stud_email, stud_mobile, stud_pass, ipaddress } = req.body;
            if (!stud_fname || !stud_email || !stud_mobile || !stud_pass || !ipaddress)
                throw createError.BadRequest();

            const otpNo = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
            console.log("OTP", otpNo);

            let studPassword = Buffer.from(stud_pass).toString("base64");

            const user = await db.Student.count({
                where: { [Op.or]: [{ stud_email }, { stud_mobile }] },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const schooluser = await db.SchoolStudent.count({
                where: { [Op.or]: [{ stud_email }, { stud_mobile }] },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            console.log(user);
            if (user == 0 && schooluser == 0) {
                const regcount = await db.Student.count({
                    where: { stud_email: { [Op.ne]: "" } },
                });
                let studregno = "HWAVI00" + (parseInt(regcount) + 1);

                const student = await db.Student.create({
                    stud_fname,
                    stud_lname: "",
                    stud_regno: studregno,
                    stud_email,
                    stud_mobile,
                    mob_otp: otpNo,
                    otp_status: "N",
                    stud_image: "",
                    stud_gender: "",
                    stud_pass: studPassword,
                    edu_qual: "",
                    med_opt: "",
                    country_id: "0",
                    state_id: "0",
                    city_id: "0",
                    parent_name: "",
                    state: "",
                    district: "",
                    location: "",
                    address: "",
                    pincode: "0",
                    parent_relation: "",
                    parent_mobile: "0",
                    stud_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    stud_status: "Y",
                    ipaddress,
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                let toEmailId = stud_email;
                let subject = "Question Cloud OTP";
                let mobileNo = stud_mobile;

                SendOtpMail(toEmailId, subject, otpNo);
                SendOtpSms(mobileNo, otpNo , stud_fname );

                res.send({ message: student });
            } else {
                throw createError.Conflict(`${stud_fname}, ${stud_email} and ${stud_mobile} Already Exists`);
            }
        } catch (error) {
            logger.error(`Error at User Signup : ${error.message}`);
            next(error);
        }
    },

    // 3. Verify OTP User
    verifyOtpStudent: async (req, res, next) => {
        try {
            const { stud_id, mob_otp } = req.body;
            const user = await db.Student.findOne({ where: { stud_id } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (!user) throw createError.Conflict(`User not found`);
            if (Number(user.mob_otp) === Number(mob_otp)) {
                await db.Student.update({ otp_status: "Y" }, { where: { stud_id } }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                res.send({ otp_status: true, message: "OTP Verified Success !!!" });
            } else {
                res.send({ otp_status: false, message: "OTP Mismatch, Verified Failed !!!" });
            }
        } catch (error) {
            logger.error(`Error at Verify OTP User : ${error.message}`);
            next(error);
        }
    },

    // 4. Resend OTP User
    resendOtpStudent: async (req, res, next) => {
        try {
            const { stud_id } = req.body;
            const user = await db.Student.findOne({
                where: { stud_id, stud_status: { [Op.ne]: "D" } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (!user) throw createError.Conflict(`User not found`);

            let otpNo = user.mob_otp;
            let toEmailId = user.stud_email;
            let subject = "Question Cloud Resend OTP";
            let mobileNo = user.stud_mobile;

            SendOtpMail(toEmailId, subject, otpNo);
            SendOtpSms(mobileNo, otpNo , user.stud_fname);
            res.send({ message: "OTP Sent Successfully !!!" });
        } catch (error) {
            logger.error(`Error at Resend OTP User : ${error.message}`);
            next(error);
        }
    },

    // 5. Check Value avail or not
    checkValueStudent: async (req, res, next) => {
        try {
            const { field, value } = req.body;
            if (!field || !value) throw createError.BadRequest();
            const count = await db.Student.count({
                where: { [field]: value, stud_status: { [Op.ne]: "D" } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const schoolcount = await db.SchoolStudent.count({
                where: { [field]: value, stud_status: { [Op.ne]: "D" } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count, schoolcount });
        } catch (error) {
            logger.error(`Error at Check value avail or not : ${error.message}`);
            next(error);
        }
    },

    // 6. Forgot Password User
    forgotPasswordStudent: async (req, res, next) => {
        try {
            const { stud_mobile } = req.body;
            if (!stud_mobile) throw createError.BadRequest();

            const stud = await db.Student.findOne({
                where: { stud_mobile, stud_status: { [Op.ne]: "D" } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (stud) {
                let buff = new Buffer(stud.stud_pass, "base64");
                let text = buff.toString("ascii");
                let password = text;

                let mobileNo = stud_mobile;
                let username = stud.stud_fname;
                SendForgotPasswordSms(username, password, mobileNo);
                SendPasswordMail(stud.stud_email, "Question Cloud", password);
                res.send({ forgot_status: true, message: "Password Sent Success !!!" });
            } else {
                res.send({ forgot_status: false, message: "Password Sent Failed !!!" });
            }
        } catch (error) {
            logger.error(`Error at Forgot Password User : ${error.message}`);
            next(error);
        }
    },

    // 7. Get Single Profile User
    getProfile: async (req, res, next) => {
        try {
            const { stud_id } = req.params;
            if (!stud_id) throw createError.BadRequest();

            const stud = await db.Student.findOne({
                where: { stud_id, stud_status: { [Op.ne]: "D" } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (stud) {
                res.send({ status: true, message: stud });
            } else {
                throw createError.NotFound("Student Not Found !!!");
            }
        } catch (error) {
            logger.error(`Error at Get Single Profile User : ${error.message}`);
            next(error);
        }
    },

    // 8. Update Profile User
    updateProfile: async (req, res, next) => {
        try {
            await upload(req, res, function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }

                const { stud_id } = req.params;
                if (!stud_id) throw createError.BadRequest();
                
                db.sequelize.transaction(async (t) => {
                    if (req.files && req.files.stud_image && req.files.stud_image.length) {
                        await db.Student.update(
                            { ...req.body, stud_image: req.files.stud_image[0].filename },
                            { where: { stud_id, stud_status: { [Op.ne]: "D" } } }
                        ).catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                        res.send({ status: true, message: "User Profile Updated" });
                    } else {
                        delete req.body.stud_image;
                        console.log(req.body);
                        await db.Student.update(
                            { ...req.body },
                            { where: { stud_id, stud_status: { [Op.ne]: "D" } } }
                        ).catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                        res.send({ status: true, message: "User Profile Updated" });
                    }
                });
            });
        } catch (error) {
            logger.error(`Error at Update Profile User : ${error.message}`);
            next(error);
        }
    },

    // 9. Update Profile for Mobile
    updateProfileMobile: async (req, res, next) => {
        try {
            const { stud_id } = req.params;
            if (!stud_id) throw createError.BadRequest();
            const { user } = req;
            db.sequelize.transaction(async (t) => {
                if (req.body.stud_image != "") {
                    let filename = await uploadProfileImage(req.body.stud_image, user);

                    await db.Student.update(
                        { ...req.body, stud_image: filename },
                        { where: { stud_id, stud_status: { [Op.ne]: "D" } } }
                    ).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    res.send({ status: true, message: "User Profile Updated" });
                } else {
                    delete req.body.stud_image;
                    console.log(req.body);
                    await db.Student.update(
                        { ...req.body },
                        { where: { stud_id, stud_status: { [Op.ne]: "D" } } }
                    ).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    res.send({ status: true, message: "User Profile Updated" });
                }
            });
        } catch (error) {
            logger.error(`Error at Update Profile User : ${error.message}`);
            next(error);
        }
    },
    // 9. Verify Refresh token
    getRefreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            let payload = await verifyRefreshToken(refreshToken);
            let accToken = await signAccessToken(payload);
            let refToken = await signRefreshToken(payload);
            res.send({ token: accToken, refreshToken: refToken });
        } catch (error) {
            next(error);
        }
    },

    userLogout: async (req, res, next) => {
        try {
            await db.UserLogin.update({ logout_flag: 1, token_deleted: 1, logged_out: 1, logged_out_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") }, { where: { stud_id: req.user.id, logout_flag: 0 } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ message: "Logout Success !!!" });
        } catch (error) {
            logger.error(`Error at Logout User : ${error.message}`);
            next(error);
        }
    },

    logoutAllUser: async (req, res, next) => {
        try {
            const { userid } = req.params;
            if (!userid) throw createError.BadRequest();

            const stud = await db.UserLogin.update({
                logout_flag: 1,
                token_deleted: 1,
                logged_out: 1,
                logged_out_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
            },
                { where: { user_name: userid, logout_flag: 0, mobile_flag: 0 } }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            if (stud) {
                res.send({ status: true });
            } else {
                throw createError.NotFound("Student Not Found !!!");
            }
        } catch (error) {
            logger.error(`Error at Get Single Profile User : ${error.message}`);
            next(error);
        }
    },
};

/* 
    1. Convert base64 to image
    2. Upload Directory
    3. Return, Filename
*/
uploadProfileImage = async (baseImage, user) => {
    //Find extension of file
    const ext = baseImage.substring(baseImage.indexOf("/") + 1, baseImage.indexOf(";base64"));
    const fileType = baseImage.substring("data:".length, baseImage.indexOf("/"));
    //Forming regex to extract base64 data of file.
    const regex = new RegExp(`^data:${fileType}\/${ext};base64,`, "gi");
    //Extract base64 data.
    const base64Data = baseImage.replace(regex, "");

    let usertype = user.type;
    let userid = user.id;
    const filename = `file-${usertype}-${userid}-${Date.now()}.${ext}`;

    fs.writeFileSync(profilesDir + "/" + filename, base64Data, "base64");
    return filename;
};
