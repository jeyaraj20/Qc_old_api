const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/schoolLogger");

module.exports = {
    // 1. Get All Active Category - School
    getAllActiveSchoolCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.SchoolQuestionCategory.findAndCountAll({
                where: { cat_status: "Y", pid: 0, schoolid: req.user.id },
                order: [["cat_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Category - School : ${error.message}`);
            next(error);
        }
    },

    getAllSchoolCategoryByAsc: async (req, res, next) => {
        try {
            /*const { count, rows } = await db.SchoolQuestionCategory.findAndCountAll({
                where: { cat_status: "Y", pid: 0, schoolid: req.user.id },
                order: [["cat_name", "ASC"]],
            });*/

            const [count, rows] = await db.sequelize.query(
                `
                SELECT cat_id, pid, cat_name, IF(CAST(cat_name as signed)= 0,1000,CAST(cat_name as signed)) as bincat, 
                cat_slug, cat_code, cat_desc, cat_image, cat_pos, cat_status, cat_dt, cat_lastupdate FROM tbl__school_question_category 
                WHERE cat_status = 'Y' AND pid = 0 AND schoolid = ${req.user.id} ORDER BY bincat, TRIM(cat_name) ASC
                `
            );

            if (!rows) {
                throw createError.NotFound("Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Category - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Category By Id
    getSchoolCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();

            let category = await db.SchoolQuestionCategory.findOne({
                where: {
                    cat_id: catId,
                    schoolid: req.user.id,
                    cat_status: "Y",
                },
            });

            if (!category) throw createError.NotFound("Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Category By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Category By Position
    getSchoolCategoryByPosition: async (req, res, next) => {
        try {
            let { position, schoolId } = req.params;
            if (position == 0) throw createError.BadRequest();

            let category = await db.SchoolQuestionCategory.findAll({
                where: {
                    schoolid: req.user.id,
                    cat_pos: position,
                    cat_status: "Y",
                },
                order: [["cat_name"]],
            });

            if (!category) throw createError.NotFound("Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Category By Position - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Category
    createSchoolCategory: async (req, res, next) => {
        try {
            const { cat_name, cat_slug, cat_pos } = req.body;
            if (!cat_name || !cat_slug || !cat_pos)
                throw createError.BadRequest();
            let schoolid = req.user.id;
            console.log(schoolid);
            await db.SchoolQuestionCategory.create({
                pid: "0",
                schoolid,
                cat_name,
                cat_slug,
                cat_code: "",
                cat_desc: "",
                cat_image: "",
                cat_pos,
                cat_status: "Y",
                cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                cat_lastupdate: moment(Date.now()).format(
                    "YYYY-MM-DD HH:mm:ss"
                ),
            })
                .then((message) => res.send({ message }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Create Category - School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Category By Id
    updateSchoolCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();

            const { cat_name, cat_slug, cat_pos } = req.body;
            if (!cat_name || !cat_slug || !cat_pos)
                throw createError.BadRequest();

            await db.SchoolQuestionCategory.update(
                {
                    cat_name,
                    cat_slug,
                    cat_pos,
                    cat_lastupdate: moment(Date.now()).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),
                },
                { where: { cat_id: catId, schoolid: req.user.id } }
            )
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Category By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Inactive'
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
            logger.error(`Error at Update Category Status - School : ${error.message}`);
            next(error);
        }
    },

    // 7. Update 'Delete'
    updateDeleteById: async (req, res, next) => {
        try {
            let { catId, schoolId } = req.body;
            if (!catId) throw createError.BadRequest();

            await db.SchoolQuestionCategory.update(
                { cat_status: "D" },
                { where: { cat_id: catId, schoolid: req.user.id } }
            )
                .then((result) => res.sendStatus(204))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Delete Category By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 8. Update 'Position'
    updatePositionById: async (req, res, next) => {
        try {
            const { values } = req.body;
            if (!values) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                values.forEach(async (val) => {
                    await db.SchoolQuestionCategory.update(
                        { cat_pos: val.position },
                        { where: { cat_id: val.catId, schoolid: req.user.id } },
                        { transaction: t }
                    );
                });
            });
            res.send({ message: "Update Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Category Position - School : ${error.message}`);
            next(error);
        }
    },

    // 9. Get All InActive Category
    getAllInactiveSchoolCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.SchoolQuestionCategory.findAndCountAll({
                where: { cat_status: "N", pid: 0, schoolid: req.user.id },
                order: [["cat_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All InActive Category - School : ${error.message}`);
            next(error);
        }
    },
    
    // Get School Category By Name
    getSchoolCategoryByName: async (req, res, next) => {
        try {
            let { cat_name } = req.params;
            const { count, rows } = await db.SchoolQuestionCategory.findAndCountAll({
                where: { cat_name: cat_name, pid: 0, schoolid: req.user.id }
            });
            if (!rows)
                throw createError.NotFound("Question category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get School Category By Name - School : ${error.message}`);
            next(error);
        }
    }
};
