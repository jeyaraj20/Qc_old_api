const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/schoolLogger");

module.exports = {
    // 1. Get All Active Operator
    getAllStaffAssign: async (req, res, next) => {
        try {

            const [Operator] = await db.sequelize.query(
                `SELECT  a.staffassign_id, a.examcategory_id, c.op_name,c.op_id, c.op_type,
                GROUP_CONCAT(b.exa_cat_name ORDER BY b.exa_cat_id) examcategoryname
        FROM    tbl__school_staffassign a
                INNER JOIN tbl__school_exam_category b
                ON FIND_IN_SET(b.exa_cat_id, a.examcategory_id) > 0
        inner JOIN tbl__school_operator as c on c.op_id = a.staff_id
                where a.school_id=?
        GROUP   BY a.staffassign_id`,
                { replacements: [req.user.id] }
            );

            if (!Operator) throw createError.NotFound("Operator Not Found !!!");
            res.send({ count: Operator.length, Operator });
        } catch (error) {
            logger.error(`Error at Get All Active Operator - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Get All InActive Operator
    getAllInactiveSchoolOperator: async (req, res, next) => {
        try {
            const { count, rows } = await db.SchoolOperator.findAndCountAll({
                where: { op_status: "N", schoolid: req.user.id },
                order: [["op_type"]],
            });

            if (!rows) {
                throw createError.NotFound("Operator Not Found !!!");
            }
            res.send({ count, Operator: rows });
        } catch (error) {
            logger.error(`Error at Get All InActive Operator - School : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Operator By Id
    getSchoolOperatorById: async (req, res, next) => {
        try {
            let { opId } = req.params;
            if (opId == 0) throw createError.BadRequest();

            let Operator = await db.SchoolOperator.findOne({
                where: {
                    op_id: opId,
                    op_status: "Y",
                    schoolid: req.user.id
                },
            });

            if (!Operator) throw createError.NotFound("Operator Not Found !!!");
            res.send({ Operator });
        } catch (error) {
            logger.error(`Error at Get Operator By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Operator
    assignSchoolStaff: async (req, res, next) => {
        try {
            const {
                school_id,
                staff_id,
                examcategory_id
            } = req.body;
            if (!school_id || !staff_id || !examcategory_id)
                throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.SchoolStaffAssign.create(
                    {
                        school_id,
                        staff_id,
                        examcategory_id
                    },
                    { transaction: t }
                )
                    .then((message) => res.send({ message }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Create Operator - School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Operator By Id
    updateSchoolStaff: async (req, res, next) => {
        try {
            let { id } = req.params;
            if (id == 0) throw createError.BadRequest();

            const {
                school_id,
                staff_id,
                examcategory_id
            } = req.body;
            if (!school_id || !staff_id || !examcategory_id)
                throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.SchoolStaffAssign.update(
                    {
                        school_id,
                        staff_id,
                        examcategory_id
                    },
                    { where: { staffassign_id: id, school_id: req.user.id } },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Updated Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Operator By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Inactive / Active / Delete'
    updateInactiveById: async (req, res, next) => {
        try {
            let { opId, status } = req.body;
            if (!opId || !status) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.SchoolOperator.update(
                    { op_status: status },
                    { where: { op_id: opId, schoolid: req.user.id } },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Updated Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Operator Status - School : ${error.message}`);
            next(error);
        }
    },
};
