const db = require("../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
const crypto = require("crypto");
const XLSX = require("xlsx");
var fs = require("fs");
const multer = require("multer");
const logger = require("../helper/schoolLogger");
const {
    ExcelFilter,
    SendForgotPasswordSms,
    SendPasswordMail,
    SendOtpSms,
} = require("../helper/general_helper");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var homeCategoryDir = path.join(process.env.schoolStudentsExcel);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.schoolStudentsExcel);
    },
    filename: (req, file, callBack) => {
        callBack(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: ExcelFilter,
    limits: { fileSize: "2mb" },
}).fields([
    {
        name: "excel",
        maxCount: 1,
    },
]);

//-------------------------- Multer Part End ---------------------------------------//

module.exports = {
    // 1. Get All Student
    getAllStudent: async (req, res, next) => {
        try {
            let { stud_status } = req.params;
            if (stud_status == 0) throw createError.BadRequest();

            const { count, rows } = await db.SchoolStudent.findAndCountAll({
                where: { stud_status: stud_status, school_id: req.user.schoolid },
                order: [["stud_regno"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (!rows) throw createError.NotFound("Student Not Found !!!");
            res.send({ count, Student: rows });
        } catch (error) {
            logger.error(`Error at Get All Student - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Student By Id
    getStudentById: async (req, res, next) => {
        try {
            let { stud_id, school_id } = req.body;
            if (stud_id == 0 || school_id == 0) throw createError.BadRequest();

            let Student = await db.SchoolStudent.findOne({
                where: { stud_id, school_id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (!Student) res.send({ message: "Student Not Found !!!" });
            res.send({ Student });
        } catch (error) {
            logger.error(`Error at Get Student By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 3. Create Many Student
    createBulkStudent: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { students, school_id, ipaddress, category_id } = req.body;
            if (!students || !school_id || !ipaddress || !category_id)
                throw createError.BadRequest();

            let alreadyExists = [];
            for (let val of students) {
                // Check if the student exist or not
                const studCount = await db.SchoolStudent.count({
                    where: {
                        [Op.or]: [{ stud_email: val.Email }, { stud_mobile: val.Mobile }],
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                // If, Not Exist
                const studSchool = await db.School.findOne({
                    where: { id: school_id },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                const schoolStudCount = await db.SchoolStudent.count({
                    where: { school_id: school_id },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                const studLimit = studSchool ? studSchool.totalStudents : 0;
                console.log(studLimit)
                // If, Not Exist
                if (studCount === 0 && schoolStudCount < studLimit) {
                    // OTP and Password for Student
                    const otpNo = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
                    const stud_pass = Math.random().toString(36).slice(-6).toLocaleUpperCase();
                    let studPassword = Buffer.from(stud_pass).toString("base64");

                    // Add Student to tbl__school_student
                    const [student, created] = await db.SchoolStudent.findOrCreate({
                        where: {
                            [Op.or]: [
                                { stud_email: val.Email },
                                { stud_mobile: val.Mobile },
                                { stud_regno: val.RegisterNo },
                            ],
                            school_id: school_id,
                        },
                        defaults: {
                            category_id,
                            stud_regno: val.RegisterNo,
                            stud_fname: val.FirstName,
                            stud_lname: val.LastName,
                            stud_email: val.Email,
                            stud_mobile: val.Mobile,
                            stud_gender: val.Gender,
                            school_id,
                            mob_otp: otpNo,
                            otp_status: "Y",
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
                            stud_image: "",
                            stud_dob: moment(Date.now()).format("YYYY-MM-DD"),
                            stud_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            stud_status: "Y",
                            ipaddress,
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        },
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    if (created) {
                        // Send Mail
                        SendPasswordMail(student.stud_email, "Question Cloud", stud_pass);
                        // Send SMS
                        SendForgotPasswordSms(val.FirstName, stud_pass, student.stud_mobile);
                    } else {
                        alreadyExists.push(val);
                    }
                } else {
                    alreadyExists.push(val);
                }
            }
            if (alreadyExists.length > 0) {
                res.send({
                    status: false,
                    message: "Some Students Already Exists",
                    students: alreadyExists,
                });
            } else {
                res.send({ status: true, message: "All Students Uploaded Successfully !!" });
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Many Student - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Update Student
    updateStudent: async (req, res, next) => {
        try {
            let { id } = req.params;
            const {
                category_id,
                main_category_id,
                stud_regno,
                stud_fname,
                stud_lname,
                stud_email,
                stud_mobile,
                stud_gender,
                ipaddress,
            } = req.body;

            if (
                !category_id ||
                !stud_regno ||
                !stud_fname ||
                !stud_lname ||
                !stud_email ||
                !stud_mobile ||
                !stud_gender ||
                !ipaddress
            ) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.SchoolStudent.update(
                    {
                        category_id,
                        school_id: req.user.id,
                        stud_regno,
                        stud_fname,
                        stud_lname,
                        stud_email,
                        stud_mobile,
                        stud_gender,
                        main_category_id: main_category_id ? main_category_id : ''
                    },
                    { where: { school_id: req.user.id, stud_id: id } },
                    { transaction: t }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            });
            res.send({ message: "Students Updated Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Student By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Inactive / Active / Delete'
    updateStatus: async (req, res, next) => {
        try {
            let { status, stud_id } = req.body;
            if (!stud_id || !status) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.SchoolStudent.update(
                    { stud_status: status },
                    { where: { school_id: req.user.id, stud_id } },
                    { transaction: t }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            });
            res.send({ message: "Students Updated Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Student Status - School : ${error.message}`);
            next(error);
        }
    },

    // 7. Read Multi Student (Excel Upload)
    readBulkStudent: async (req, res, next) => {
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

            let filePath = req.files.excel[0].path;

            var workbook = XLSX.readFile(filePath);
            var sheet_name_list = workbook.SheetNames;
            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            res.send({ xlData });
        });
    },

    // 8. Download Sample format excel file
    getSampleExcelFile: async (req, res, err) => {
        /* original data */
        var data = [{ RegNo: "", FirstName: "", LastName: "", Email: "", Mobile: "", Gender: "" }];

        /* make the worksheet */
        var ws = XLSX.utils.json_to_sheet(data);

        /* add to workbook */
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");

        /* generate an XLSX file */
        let exportFileName = `sampleformat.xls`;
        let filePath = path.join(__dirname, "../public/excels/sampleformat.xls");
        XLSX.writeFile(wb, filePath);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", "attachment; filename=" + exportFileName);
        res.sendFile(filePath, function (err) {
            console.log("Error downloading file: " + err);
        });
    },

    // 8. Create One Student
    createStudent: async (req, res, next) => {
        try {
            const school_id = req.user.schoolid;
            const {
                category_id,
                main_category_id,
                stud_regno,
                stud_fname,
                stud_lname,
                stud_email,
                stud_mobile,
                stud_gender,
                ipaddress,
            } = req.body;

            if (
                !category_id ||
                !stud_regno ||
                !stud_fname ||
                !stud_lname ||
                !stud_email ||
                !stud_mobile ||
                !stud_gender ||
                !ipaddress
            )
                throw createError.BadRequest();

            // Check if the student exist or not
            const studCount = await db.SchoolStudent.count({
                where: { [Op.or]: [{ stud_email }, { stud_mobile }] },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            const studSchool = await db.School.findOne({
                where: { id: school_id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            const schoolStudCount = await db.SchoolStudent.count({
                where: { school_id: school_id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            const studLimit = studSchool ? studSchool.totalStudents : 0;
            console.log(studLimit)
            // If, Not Exist
            if (studCount === 0 && schoolStudCount < studLimit) {
                // OTP and Password for Student
                const otpNo = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
                const stud_pass = Math.random().toString(36).slice(-6).toLocaleUpperCase();
                let studPassword = Buffer.from(stud_pass).toString("base64");
                console.log("OTP", otpNo, "Password", studPassword);

                // Add Student to tbl__school_student
                const [student, created] = await db.SchoolStudent.findOrCreate({
                    where: {
                        [Op.or]: [{ stud_email }, { stud_mobile }, { stud_regno }],
                        school_id,
                    },
                    defaults: {
                        category_id,
                        main_category_id: main_category_id ? main_category_id : '',
                        school_id: req.user.id,
                        stud_regno,
                        stud_fname,
                        stud_lname,
                        stud_email,
                        stud_mobile,
                        stud_gender,
                        school_id,
                        mob_otp: otpNo,
                        otp_status: "Y",
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
                        stud_image: "",
                        stud_dob: moment(Date.now()).format("YYYY-MM-DD"),
                        stud_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        stud_status: "Y",
                        ipaddress,
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                if (created) {
                    // Send Mail
                    SendPasswordMail(stud_email, "Question Cloud", stud_pass);
                    // Send SMS
                    SendForgotPasswordSms(stud_fname, stud_pass, stud_mobile);
                    res.send({ statusCode: 200, student });
                } else {
                    res.send({ statusCode: 404, message: "Already Exists" })
                    // throw createError.Conflict(`${stud_fname} ${stud_lname} Already Exists`);
                }
            } else {
                if (schoolStudCount >= studLimit) {
                    res.send({ statusCode: 201, message: "Student limit reached.Please contact your administrator." })
                    //throw createError.Conflict(`Student limit reached.Please contact your administrator.`);
                }
                throw createError.Conflict(`${stud_fname} ${stud_lname} - Already Exists`);
            }
        } catch (error) {
            logger.error(`Error at Create One Student - School : ${error.message}`);
            next(error);
        }
    },
};
