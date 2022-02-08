const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require('../helper/adminLogger');

module.exports = {
    // 1. Get All Active Student
    getAllStudent: async (req, res, next) => {
        try {
            let { stud_status } = req.params;
            if (stud_status == 0) throw createError.BadRequest();

            const { count, rows } = await db.Student.findAndCountAll({
                where: { stud_status: stud_status },
                order: [["stud_regno"]],
            });

            if (!rows) {
                throw createError.NotFound("Student Not Found !!!");
            }
            res.send({ count, Student: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Student : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Student By Id
    getStudentById: async (req, res, next) => {
        try {
            let { stud_id } = req.params;
            if (stud_id == 0) throw createError.BadRequest();

            let Student = await db.Student.findOne({
                where: { stud_id: stud_id },
            });

            if (!Student) throw createError.NotFound("Student Not Found !!!");
            res.send({ Student });
        } catch (error) {
            logger.error(`Error at Get Student By Id : ${error.message}`);
            next(error);
        }
    },

    // 3. Create Student
    createStudent: async (req, res, next) => {
        try {
            const {
                stud_fname,
                stud_lname,
                stud_regno,
                stud_email,
                stud_mobile,
                stud_gender,
                ipaddress,
            } = req.body;
            if (
                !stud_fname ||
                !stud_lname ||
                !stud_regno ||
                !stud_email ||
                !stud_mobile ||
                !stud_gender ||
                !ipaddress
            )
                throw createError.BadRequest();
            db.sequelize.transaction(async (t) => {
                await db.Student.create(
                    {
                        stud_fname,
                        stud_lname,
                        stud_dob: moment(Date.now()).format("YYYY-MM-DD"),
                        stud_regno,
                        stud_email,
                        stud_mobile,
                        mob_otp: "",
                        otp_status: "N",
                        stud_image: "",
                        stud_gender,
                        stud_pass: "",
                        edu_qual: "",
                        med_opt: "",
                        country_id: "",
                        state_id: "",
                        city_id: "",
                        parent_name: "",
                        state: "",
                        district: "",
                        location: "",
                        address: "",
                        pincode: "",
                        parent_relation: "",
                        parent_mobile: "",
                        stud_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        stud_status: "Y",
                        ipaddress,
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Create Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Create Student : ${error.message}`);
            next(error);
        }
    },

    // 4. Update Student By Id
    updateStudentById: async (req, res, next) => {
        try {
            const { stud_id } = req.params;
            const {
                stud_fname,
                stud_lname,
                stud_regno,
                stud_email,
                stud_mobile,
                stud_gender,
                ipaddress,
            } = req.body;
            if (
                !stud_fname ||
                !stud_lname ||
                !stud_regno ||
                !stud_email ||
                !stud_mobile ||
                !stud_gender ||
                !ipaddress
            )
                throw createError.BadRequest();
            db.sequelize.transaction(async (t) => {
                await db.Student.update(
                    {
                        stud_fname,
                        stud_lname,
                        stud_dob: moment(Date.now()).format("YYYY-MM-DD"),
                        stud_regno,
                        stud_email,
                        stud_mobile,
                        mob_otp: "",
                        otp_status: "N",
                        stud_image: "",
                        stud_gender,
                        stud_pass: "",
                        edu_qual: "",
                        med_opt: "",
                        country_id: "",
                        state_id: "",
                        city_id: "",
                        parent_name: "",
                        state: "",
                        district: "",
                        location: "",
                        address: "",
                        pincode: "",
                        parent_relation: "",
                        parent_mobile: "",
                        stud_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        stud_status: "Y",
                        ipaddress,
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { where: { stud_id: stud_id } },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Update Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Student : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Inactive / Active / Delete'
    updateStatusById: async (req, res, next) => {
        try {
            let { stud_id, status } = req.body;
            if (!stud_id || !status) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.Student.update(
                    { stud_status: status },
                    { where: { stud_id: stud_id } },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Updated Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Student Status : ${error.message}`);
            next(error);
        }
    },

    // 6. Get Students Count Only
    getStudentsCount: async (req, res, next) => {
        try {
            const { stud_status } = req.params;
            if (stud_status == null) throw createError.BadRequest();
            const count = await db.Student.count({
                where: { stud_status: stud_status },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get Students Count Only : ${error.message}`);
            next(error);
        }
    },

};
