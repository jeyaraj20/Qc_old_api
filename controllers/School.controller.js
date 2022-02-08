const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const { ImageFilter } = require("../helper/general_helper");
const logger = require("../helper/adminLogger");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var homeCategoryDir = path.join(process.env.school);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.school);
    },
    filename: (req, file, callBack) => {
        callBack(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: ImageFilter,
    limits: { fileSize: "2mb" },
}).fields([
    {
        name: "schoolLogo",
        maxCount: 1,
    },
]);


//-------------------------- Multer Part End ---------------------------------------//

module.exports = {
    // 1. Get All Schools
    getAllSchool: async (req, res, next) => {
        try {
            let { schoolStatus } = req.params;
            if (schoolStatus == 0) throw createError.BadRequest();

            const { count, rows } = await db.School.findAndCountAll({
                where: { schoolStatus: schoolStatus },
                order: [["schoolName"]],
            });

            if (!rows) {
                throw createError.NotFound("School Not Found !!!");
            }
            res.send({ count, School: rows });
        } catch (error) {
            logger.error(`Error at Get All Schools : ${error.message}`);
            next(error);
        }
    },

    // 2. Get School By Id
    getSchoolById: async (req, res, next) => {
        try {
            let { id } = req.params;
            if (id == 0) throw createError.BadRequest();

            const { Count, rows } = await db.School.findAndCountAll({
                where: { id: id },
                include: [
                    {
                        model: db.SchoolQCExam,
                        where: { activeStatus: 'Y' }
                    }
                ]
            });

            if (!rows) throw createError.NotFound("School Not Found !!!");
            res.send({ rows });
        } catch (error) {
            logger.error(`Error at Get School By Id: ${error.message}`);
            next(error);
        }
    },

    // 3. Create School
    createSchool: async (req, res, next) => {
        try {
            upload(req, res, function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }
                console.log(req.body);
                const {
                    schoolName,
                    address1,
                    address2,
                    phoneNumber,
                    emailId,
                    password,
                    contactPerson,
                    mobileNumber,
                    totalStudents,
                    ipAddress,
                    expirydate,
                    examdata
                } = req.body;
                if (
                    !schoolName ||
                    !address1 ||
                    !address2 ||
                    !phoneNumber ||
                    !emailId ||
                    !password ||
                    !contactPerson ||
                    !mobileNumber ||
                    !totalStudents ||
                    !expirydate
                )
                    throw createError.BadRequest();
                let schoolPassword = Buffer.from(password).toString("base64");
                db.sequelize.transaction(async (t) => {
                    let school = await db.School.create(
                        {
                            schoolName,
                            schoolLogo: req.files.schoolLogo[0].filename,
                            address1,
                            address2,
                            phoneNumber,
                            emailId,
                            password: schoolPassword,
                            contactPerson,
                            mobileNumber,
                            totalStudents,
                            schoolStatus: "Y",
                            ipAddress,
                            createdBy: req.user.userid,
                            createdTimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            expiryDate: expirydate
                        },
                        { transaction: t }
                    )
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                    if (school) {
                        let examdatafinal = JSON.parse(examdata);
                        let examlist = [];
                        examdatafinal.forEach((list) => {
                            let subcatarray = list.subcategoryid;
                            let subcatid = subcatarray.join();
                            examlist.push({
                                schoolRefId: school.id,
                                masterCategory: list.mastercategoryId,
                                mainCategory: list.categoryId,
                                subCategory: subcatid,
                                chapterIds: list.chaptersIds.join(),
                                activeStatus: 'Y',
                                ipAddress,
                                createdBy: req.user.userid,
                                createdTimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                            });
                        });
                        // 2. tbl__automatic_question_details insert
                        await db.SchoolQCExam.bulkCreate(examlist, {
                            transaction: t,
                        }).catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                        res.send({ message: "School Created Success !!!" });
                        await t.commit();

                    }
                    else {
                        throw createError.InternalServerError("not created");
                    }

                    //res.send({ message: "School Created !!!" });      
                });
            });
        } catch (error) {
            logger.error(`Error at Create School : ${error.message}`);
            next(error);
        }
    },

    // 4. Update School By Id
    updateSchoolById: async (req, res, next) => {
        try {
            let { id } = req.params;
            if (id == 0) throw createError.BadRequest();

            upload(req, res, function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }
                const {
                    schoolName,
                    schoolLogo,
                    address1,
                    address2,
                    phoneNumber,
                    emailId,
                    password,
                    contactPerson,
                    mobileNumber,
                    totalStudents,
                    ipAddress,
                    examdata,
                    expirydate
                } = req.body;
                if (
                    !schoolName ||
                    !address1 ||
                    !address2 ||
                    !phoneNumber ||
                    !emailId ||
                    !password ||
                    !contactPerson ||
                    !mobileNumber ||
                    !totalStudents ||
                    !ipAddress ||
                    !expirydate
                )
                    throw createError.BadRequest();
                let schoolPassword = Buffer.from(password).toString("base64");
                db.sequelize.transaction(async (t) => {
                    await db.School.update(
                        {
                            schoolName,
                            schoolLogo: req.files && req.files.schoolLogo ? req.files.schoolLogo[0].filename : schoolLogo,
                            address1,
                            address2,
                            phoneNumber,
                            emailId,
                            password: schoolPassword,
                            contactPerson,
                            mobileNumber,
                            totalStudents,
                            schoolStatus: "Y",
                            ipAddress,
                            expiryDate: expirydate,
                            updatedBy: "1",
                            updatedTimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        },
                        { where: { id: id } },
                        { transaction: t }
                    )
                        //   .then((result) => res.send({ message: "Update Success" }))
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });


                    await db.SchoolQCExam.update(
                        {
                            activeStatus: 'D',
                        },
                        { where: { schoolRefId: id } },
                        { transaction: t }
                    )
                        //   .then((result) => res.send({ message: "Update Success" }))
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                    let examdatafinal = JSON.parse(examdata);
                    let examlist = [];
                    examdatafinal.forEach((list) => {
                        let subcatarray = list.subcategoryid;
                        let subcatid = subcatarray.join();
                        examlist.push({
                            schoolRefId: id,
                            masterCategory: list.mastercategoryId,
                            mainCategory: list.categoryId,
                            subCategory: subcatid,
                            chapterIds : list.chaptersIds.join(),
                            activeStatus: 'Y',
                            ipAddress,
                            createdBy: req.user.userid,
                            createdTimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                        });
                    });
                    // 2. tbl__automatic_question_details insert
                    await db.SchoolQCExam.bulkCreate(examlist, {
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                    res.send({ message: "School Updated Success !!!" });
                    //await t.commit();

                });
            });
        } catch (error) {
            logger.error(`Error at Update School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Inactive / Active / Delete'
    updateStatusById: async (req, res, next) => {
        try {
            let { id, status } = req.body;
            if (!id || !status) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.School.update(
                    { schoolStatus: status },
                    { where: { id: id } },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Updated Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update School Status : ${error.message}`);
            next(error);
        }
    },

    // 6. Get Schools Count Only
    getSchoolsCount: async (req, res, next) => {
        try {
            let { schoolStatus } = req.params;
            if (schoolStatus == null) throw createError.BadRequest();
            const count = await db.School.count({ where: { schoolStatus } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get Schools Count Only : ${error.message}`);
            next(error);
        }
    },
};
