const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/adminLogger");

module.exports = {
    // 1. Get All Active Category
    getAllActiveCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.Category.findAndCountAll({
                where: { cat_status: "Y", pid: 0 },
                order: [["cat_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Category : ${error.message}`);
            next(error);
        }
    },

    getAllCategoryByAsc: async (req, res, next) => {
        try {

            const [count, rows] = await db.sequelize.query(
                `
                SELECT cat_id, pid, cat_name, IF(CAST(cat_name as signed)= 0,1000,CAST(cat_name as signed)) as bincat, 
                cat_slug, cat_code, cat_desc, cat_image, cat_pos, cat_status, cat_dt, cat_lastupdate FROM tbl__category 
                WHERE cat_status = 'Y' AND pid = 0 ORDER BY bincat, TRIM(cat_name) ASC
                `
            );

            if (!rows) {
                throw createError.NotFound("Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Category : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Category By Id
    getCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();

            let category = await db.Category.findOne({
                where: {
                    cat_id: catId,
                    cat_status: "Y",
                },
            });

            if (!category) throw createError.NotFound("Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Category By Id : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Category By Position
    getCategoryByPosition: async (req, res, next) => {
        try {
            let { position } = req.params;
            if (position == 0) throw createError.BadRequest();

            let category = await db.Category.findAll({
                where: {
                    cat_pos: position,
                    cat_status: "Y",
                },
                order: [["cat_name"]],
            });

            if (!category) throw createError.NotFound("Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Category By Position : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Category
    createCategory: async (req, res, next) => {
        try {
            const { cat_name, cat_slug, cat_pos } = req.body;
            if (!cat_name || !cat_slug || !cat_pos) throw createError.BadRequest();

            await db.Category.create({
                pid: "0",
                schoolid: "1",
                cat_name,
                cat_slug,
                cat_code: "",
                cat_desc: "",
                cat_image: "",
                cat_pos,
                cat_status: "Y",
                cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            })
                .then((message) => res.send({ message }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Create Category : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Category By Id
    updateCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();

            const { cat_name, cat_slug, cat_pos } = req.body;
            if (!cat_name || !cat_slug || !cat_pos) throw createError.BadRequest();

            await db.Category.update(
                {
                    cat_name,
                    cat_slug,
                    cat_pos,
                    cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
                { where: { cat_id: catId } }
            )
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Category : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Inactive'
    updateInactiveById: async (req, res, next) => {
        try {
            let { catId, status } = req.body;
            if (!catId || !status) throw createError.BadRequest();

            await db.Category.update({ cat_status: status }, { where: { cat_id: catId } })
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Category Status : ${error.message}`);
            next(error);
        }
    },

    // 7. Update 'Delete'
    updateDeleteById: async (req, res, next) => {
        try {
            let { catId } = req.body;
            if (!catId) throw createError.BadRequest();

            await db.Category.update({ cat_status: "D" }, { where: { cat_id: catId } })
                .then((result) => res.sendStatus(204))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Delete Category : ${error.message}`);
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
                    await db.Category.update(
                        { cat_pos: val.position },
                        { where: { cat_id: val.catId } },
                        { transaction: t }
                    );
                });
            });
            res.send({ message: "Update Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Category Position : ${error.message}`);
            next(error);
        }
    },

    // 9. Get All InActive Category
    getAllInactiveCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.Category.findAndCountAll({
                where: { cat_status: "N", pid: 0 },
                order: [["cat_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Inactive Category : ${error.message}`);
            next(error);
        }
    },

    // Category By Name
    getCategoryByName: async (req, res, next) => {
        try {
            let { cat_name } = req.params;
            const { count, rows } = await db.Category.findAndCountAll({
                where: { cat_name: cat_name, pid: 0 },
            });
            if (!rows) throw createError.NotFound("Question category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get Category By Name : ${error.message}`);
            next(error);
        }
    },

    // 11. Get QBank Main Category Count Only
    getCategoryCount: async (req, res, next) => {
        try {
            let { cat_status } = req.params;
            if (cat_status == null) throw createError.BadRequest();
            let count = 0;
            count = await db.Category.count({
                where: { cat_status, pid: 0 },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get QBank Main Category Count Only : ${error.message}`);
            next(error);
        }
    },
};
