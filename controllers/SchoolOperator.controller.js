const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/schoolLogger");

module.exports = {
    // 1. Get All Active Operator
    getAllActiveSchoolOperator: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [Operator] = await db.sequelize.query(
                `select a.* ,count(b.quest_status) as actcount from tbl__school_operator as a 
                left join tbl__schoolquestion as b on a.op_id=quest_add_id
                  and a.op_uname=b.quest_add_by and b.quest_status !='D'
                where a.op_status=? and a.schoolid=? group by a.op_id`,
                { replacements: [status, req.user.id] }
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
                    schoolid: req.user.id,
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
    createSchoolOperator: async (req, res, next) => {
        try {
            const { schoolid, op_name, op_uname, op_password, op_type, feat_id, masterCategory, mainCategory, subCategory } = req.body;
            if (!op_name || !op_uname || !op_password || !op_type || !feat_id)
                throw createError.BadRequest();

            const password = Buffer.from(op_password).toString("base64");

            let Operator = await db.SchoolOperator.findOne({
                where: {op_uname},
            });

            if(!Operator){
                await db.sequelize.transaction(async (t) => {
                    await db.SchoolOperator.create(
                        {
                            schoolid: req.user.id,
                            op_name,
                            op_uname,
                            op_password: password,
                            op_type,
                            feat_id,
                            op_status: "Y",
                            op_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            op_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            master_category_id : String(masterCategory),
                            main_category_id : String(mainCategory),
                            sub_category_id : String(subCategory)
                        },
                        { transaction: t }
                    )
                        .then((message) => res.send({ message }))
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                });
            }else{
                logger.error(`Operator Already Exists`);
                res.sendStatus(201);
            }
        } catch (error) {
            logger.error(`Error at Create Operator - School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Operator By Id
    updateSchoolOperatorById: async (req, res, next) => {
        try {
            let { opId } = req.params;
            if (opId == 0) throw createError.BadRequest();

            const { schoolid, op_name, op_uname, op_password, op_type, feat_id, masterCategory, mainCategory, subCategory } = req.body;
            if (!op_name || !op_uname || !op_password || !op_type || !feat_id)
                throw createError.BadRequest();

            console.log( feat_id , "feat_id")
            const password = Buffer.from(op_password).toString("base64");
            await db.sequelize.transaction(async (t) => {
                await db.SchoolOperator.update(
                    {
                        schoolid,
                        op_name,
                        op_uname,
                        op_password: password,
                        op_type,
                        feat_id,
                        op_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        master_category_id : String(masterCategory),
                        main_category_id : String(mainCategory),
                        sub_category_id : String(subCategory)
                    },
                    { where: { op_id: opId, schoolid: req.user.id } },
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
            logger.error(`Error at Update Operator By Id - School : ${error.message}`);
            next(error);
        }
    },

    getAllOperator: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [Operator] = await db.sequelize.query(
                `select * from tbl__school_operator where op_status=? ORDER BY op_name ASC`,
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
