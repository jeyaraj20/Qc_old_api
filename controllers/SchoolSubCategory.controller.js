const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/schoolLogger");
const { Op } = require("sequelize");

module.exports = {
    // 1. Get All Active SubCategory
    getAllActiveSchoolSubCategory: async (req, res, next) => {
        try {
            let { status } = req.params;

            let { rows, count } = await db.SchoolQuestionCategory.findAndCountAll(
                {
                    attributes: ["cat_id", "pid", "cat_name", "cat_slug",
                        "cat_code", "cat_desc", "cat_pos"],
                    where: {
                        cat_status: status,
                        pid: { [Op.ne]: 0 },
                        schoolid: req.user.id
                    },
                    order: [["cat_pos"]]
                });

            if (!rows) res.send({ category: "Sub Category Not Found !!!" });


            let category = await db.SchoolQuestionCategory.findAll(
                {
                    attributes: ["cat_id", "cat_name"],
                    where: {
                        pid: 0,
                        schoolid: req.user.id
                    },
                });


            const [waitingquestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as waitingcount
                FROM tbl__schoolquestion where quest_status='W' and schoolid = ?
                GROUP BY sub_id`,
                { replacements: [req.user.id] }
            );

            const [activequestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as activecount
                    FROM tbl__schoolquestion where quest_status='Y' and schoolid = ?
                    GROUP BY sub_id`,
                { replacements: [req.user.id] }
            );
            res.send({
                count, subcategory: rows,
                category: category, waitingquestioncount: waitingquestioncount, activequestioncount: activequestioncount
            });
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Create SubCategory By Id
    createSchoolSubCategoryById: async (req, res, next) => {
        try {
            const { cat_name, cat_code, cat_desc, pid } = req.body;
            // if (!cat_name || !cat_code || !cat_desc || !pid|| !schoolid)
            //     throw createError.BadRequest();

            const [category, created] = await db.SchoolQuestionCategory.findOrCreate({
                where: { cat_name, cat_code, schoolid: req.user.id, },
                defaults: {
                    cat_name,
                    cat_code,
                    cat_desc,
                    pid,
                    schoolid: req.user.id,
                    cat_pos: 0,
                    cat_slug: "",
                    cat_image: "",
                    cat_status: "Y",
                    cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
            });

            if (!created)
                throw createError.Conflict(
                    `Categrory - '${cat_name}' with Code - '${cat_code}' Already Exists !!!`
                );
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Create SubCategory By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Category By Id
    getSchoolSubCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();

            /*
            let category = await db.Category.findOne({
                where: {
                    cat_id: catId,
                    cat_status: "Y",
                },
            });
            */
            const [category, metadata] = await db.sequelize.query(
                `
                SELECT 
                    e.cat_name AS 'MainCategory',
                    m.cat_name AS 'SubCategory',
                    m.cat_code AS 'UniqueCode',
                    m.cat_desc AS 'Description',
                    m.cat_id AS 'Catid',
                    e.cat_id AS 'Pid'
                FROM
                tbl__school_question_category e
                INNER JOIN tbl__school_question_category m ON 
                    m.pid = e.cat_id
                WHERE
		            e.cat_status = 'Y' and m.cat_status = 'Y' and m.schoolid = ${req.user.id} and m.cat_id = ${catId}
                `
            );

            if (!category) throw createError.NotFound("Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Category By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Update Sub Category By Id
    updateSchoolSubCategoryById: async (req, res, next) => {
        try {
            let { pid } = req.params;
            const { cat_name, cat_code, cat_desc } = req.body;
            // if (!cat_name || !cat_code || !cat_desc || pid == 0|| schoolid == 1)
            //     throw createError.BadRequest();

            /*const { count, rows } = await db.SchoolQuestionCategory.findAndCountAll({
                where: { cat_name, cat_code, schoolid: req.user.id },
            });
            if (count > 0)
                throw createError.Conflict(
                    `Categrory - '${cat_name}' with Code - '${cat_code}' Already Exists !!!`
                );*/

            await db.SchoolQuestionCategory.update(
                {
                    cat_name,
                    cat_code,
                    cat_desc,
                    cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
                { where: { cat_id: pid, schoolid: req.user.id } }
            )
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Sub Category By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Inactive'
    updateInactiveById: async (req, res, next) => {
        try {
            let { catId, status } = req.body;
            if (!catId || !status) throw createError.BadRequest();

            await db.SchoolQuestionCategory.update(
                { cat_status: status },
                { where: { cat_id: catId, schoolid: req.user.id } }
            )
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Sub Category Status - School : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Delete'
    updateSchoolDeleteById: async (req, res, next) => {
        try {
            let { catId } = req.body;
            if (!catId) throw createError.BadRequest();

            await db.SchoolQuestionCategory.update(
                { cat_status: "D" },
                { where: { cat_id: catId, schoolid: req.user.id } }
            )
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Delete Sub Category By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 7. Get All Inactive SubCategory
    getAllInActiveSchoolSubCategory: async (req, res, next) => {
        try {
            const [category, metadata] = await db.sequelize.query(
                `
                SELECT 
                    e.cat_name AS 'MainCategory',
                    m.cat_name AS 'SubCategory',
                    m.cat_code AS 'UniqueCode',
                    m.cat_desc AS 'Description',
                    m.cat_id AS 'Catid',
                    e.cat_id AS 'Pid'
                FROM
                tbl__school_question_category e
                INNER JOIN tbl__school_question_category m ON 
                    m.pid = e.cat_id
                WHERE
		            e.cat_status = 'Y' and m.cat_status = 'N'  and m.schoolid = ${req.user.id}
                `
            );

            if (!category) {
                throw createError.NotFound("SubCategory Not Found !!!");
            }
            let count = category.length;
            res.send({ count, category });
        } catch (error) {
            logger.error(`Error at Get All Inactive SubCategory - School : ${error.message}`);
            next(error);
        }
    },

    // 8. Get QBank Sub Category Count Only
    getSchoolSubCategoryCount: async (req, res, next) => {
        try {
            let { cat_status } = req.params;
            if (cat_status == null) throw createError.BadRequest();
            let count = 0;
            count = await db.SchoolQuestionCategory.count({
                where: { cat_status, pid: { [Op.ne]: 0 }, schoolid: req.user.id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get QBank Sub Category Count Only : ${error.message}`);
            next(error);
        }
    },

    getAllActiveSubCategoryAlone: async (req, res, next) => {
        try {
            let { status } = req.params;

            let { rows } = await db.SchoolQuestionCategory.findAndCountAll(
                {
                    attributes: ["cat_id", "pid", "cat_name", "cat_slug",
                        "cat_code", "cat_desc"],
                    where: {
                        cat_status: status,
                        pid: { [Op.ne]: 0 },
                    },
                    order: [["cat_pos"]]
                });

            if (!rows) res.send({ category: "Sub Category Not Found !!!" });

            let category = await db.SchoolQuestionCategory.findAll(
                {
                    attributes: ["cat_id", "cat_name"],
                    where: {
                        cat_status: status,
                        pid: 0
                    },
                });


            res.send({
                subcategory: rows, category: category
            });
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory : ${error.message}`);
            next(error);
        }
    },

    getSubCategoryByCatId: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();
            const [subcategory] = await db.sequelize.query(
                `
                SELECT e.cat_id, e.cat_name FROM tbl__school_question_category e WHERE e.pid = ${catId} and e.cat_status = 'Y' ORDER BY trim(cat_name) ASC
                `
            );

            if (!subcategory) throw createError.NotFound("Sub Category Not Found !!!");
            res.send({ subcategory });
        } catch (error) {
            logger.error(`Error at Get Sub Category By CatId : ${error.message}`);
            next(error);
        }
    },

    getSearchResult: async (req, res, next) => {
        try {
            let { searchString, cat_id, subcat_id, status } = req.body;
            if (searchString == null || cat_id == null) throw createError.BadRequest();
            if (!!searchString) searchString = `%${searchString}%`;
            let conditions;
            if (!!searchString && !!cat_id) {
                conditions = `(cat_name LIKE '${searchString}' OR cat_code LIKE '${searchString}') AND pid = '${cat_id}'`;
            } else {
                conditions = `(cat_name LIKE '${searchString}' OR cat_code LIKE '${searchString}') OR pid = '${cat_id}'`;
            }
            
            if (subcat_id && subcat_id!='M') { 
                conditions = `(cat_name LIKE '${searchString}' OR cat_code LIKE '${searchString}') OR pid = '${cat_id}' and cat_id = '${subcat_id}'`;
             }

            const [subcategory] = await db.sequelize.query(
                `
                SELECT cat_id,pid,cat_name,cat_slug,cat_code,
                cat_desc
                FROM
                tbl__school_question_category 
                WHERE
                        cat_status = ? AND ( ${conditions} ) and pid!=0
                `,
                { replacements: [status] }
            );

            if (!subcategory) res.send({ category: "Sub Category Not Found !!!" });

            let category = await db.SchoolQuestionCategory.findAll(
                {
                    attributes: ["cat_id", "cat_name"],
                    where: {
                        pid: 0
                    },
                });


            const [waitingquestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as waitingcount
                FROM tbl__schoolquestion where quest_status='W'
                GROUP BY sub_id`,
                { replacements: [] }
            );

            const [activequestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as activecount
                    FROM tbl__schoolquestion where quest_status='Y'
                    GROUP BY sub_id`,
                { replacements: [] }
            );


            res.send({
                count: subcategory.length,
                subcategory, category: category,
                waitingquestioncount: waitingquestioncount,
                activequestioncount: activequestioncount
            });
        } catch (error) {
            logger.error(`Error at Exam Sub Category Search Result : ${error.message}`);
            next(error);
        }
    },
};
