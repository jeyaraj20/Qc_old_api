const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require('../helper/adminLogger')

module.exports = {
    // 1. Get All Active Operator
    getAllActiveOperator: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [Operator] = await db.sequelize.query(
                `select a.* ,count(b.quest_status) as actcount from tbl__operator as a 
                left join tbl__question as b on a.op_id=quest_add_id
                  and a.op_uname=b.quest_add_by and b.quest_status !='D'
                where a.op_status=? group by a.op_id`,
                { replacements: [status] }
            );

            if (!Operator) throw createError.NotFound("Operator Not Found !!!");
            res.send({ count: Operator.length, Operator });
        } catch (error) {
            logger.error(`Error at Get All Active Operator : ${error.message}`);
            next(error);
        }
    },

    // 2. Get All InActive Operator
    getAllInactiveOperator: async (req, res, next) => {
        try {
            const { count, rows } = await db.Operator.findAndCountAll({
                where: { op_status: "N" },
                order: [["op_type"]],
            });

            if (!rows) {
                throw createError.NotFound("Operator Not Found !!!");
            }
            res.send({ count, Operator: rows });
        } catch (error) {
            logger.error(`Error at Get All InActive Operator : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Operator By Id
    getOperatorById: async (req, res, next) => {
        try {
            let { opId } = req.params;
            if (opId == 0) throw createError.BadRequest();

            let Operator = await db.Operator.findOne({
                where: {
                    op_id: opId,
                    op_status: "Y",
                },
            });

            if (!Operator) throw createError.NotFound("Operator Not Found !!!");
            res.send({ Operator });
        } catch (error) {
            logger.error(`Error at Get Operator By Id : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Operator
    createOperator: async (req, res, next) => {
        try {
            const { op_name, op_uname, op_password, op_type, feat_id } = req.body;
            if (!op_name || !op_uname || !op_password || !op_type || !feat_id)
                throw createError.BadRequest();

            const password = Buffer.from(op_password).toString("base64");

            await db.sequelize.transaction(async (t) => {
                await db.Operator.create(
                    {
                        op_name,
                        op_uname,
                        op_password: password,
                        op_type,
                        feat_id,
                        op_status: "Y",
                        op_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        op_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { transaction: t }
                )
                    .then((message) => res.send({ message }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Create Operator : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Operator By Id
    updateOperatorById: async (req, res, next) => {
        try {
            let { opId } = req.params;
            if (opId == 0) throw createError.BadRequest();

            const { op_name, op_uname, op_password, op_type, feat_id } = req.body;
            if (!op_name || !op_uname || !op_password || !op_type || !feat_id)
                throw createError.BadRequest();

            const password = Buffer.from(op_password).toString("base64");
            await db.sequelize.transaction(async (t) => {
                await db.Operator.update(
                    {
                        op_name,
                        op_uname,
                        op_password: password,
                        op_type,
                        feat_id,
                        op_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { where: { op_id: opId } },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Updated Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Operator : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Inactive / Active / Delete'
    updateInactiveById: async (req, res, next) => {
        try {
            let { opId, status } = req.body;
            if (!opId || !status) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.Operator.update(
                    { op_status: status },
                    { where: { op_id: opId } },
                    { transaction: t }
                )
                    .then((result) => res.send({ message: "Updated Success" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Operator Status : ${error.message}`);
            next(error);
        }
    },

    // 7. Get Operators Count Only
    getOperatorsCount: async (req, res, next) => {
        try {
            let { op_status } = req.params;
            if (op_status == null) throw createError.BadRequest();
            const count = await db.Operator.count({ where: { op_status } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get Operators Count Only : ${error.message}`);
            next(error);
        }
    },

    getAllOperator: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [Operator] = await db.sequelize.query(
                `select * from tbl__operator where op_status=? ORDER BY op_name ASC`,
                { replacements: [status] }
            );

            if (!Operator) throw createError.NotFound("Operator Not Found !!!");
            res.send({ count: Operator.length, Operator });
        } catch (error) {
            logger.error(`Error at Get All Active Operator : ${error.message}`);
            next(error);
        }
    },
};
