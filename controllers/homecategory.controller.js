const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const { Op } = require("sequelize");
const next = require("locutus/php/array/next");
const logger = require('../helper/adminLogger')

module.exports = {
    // 1. Get All Active Home Category
    getAllActiveHomeCategory: async (req, res, next) => {
        try {
            console.log(req.user);
            const { count, rows } = await db.HomeCategory.findAndCountAll({
                where: { exa_cat_status: "Y" },
                order: [["exa_cat_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Home Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Home Category : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Home Category By Id
    getHomeCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == null) throw createError.BadRequest();

            let category = await db.HomeCategory.findOne({
                where: {
                    exa_cat_id: catId,
                    exa_cat_status: "Y",
                },
            });

            if (!category) throw createError.NotFound("Home Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Home Category By Id : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Home Category By Position
    getHomeCategoryByPosition: async (req, res, next) => {
        try {
            let { position } = req.params;
            if (position < 0) throw createError.BadRequest();

            const { count, rows } = await db.HomeCategory.findAndCountAll({
                where: {
                    exa_cat_pos: position,
                    exa_cat_status: "Y",
                },
                order: [["exa_cat_name"]],
            });

            if (!rows) throw createError.NotFound("Home Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get Home Category By Position : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Home Category
    createHomeCategory: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            // const { file } = req;
            // console.log(file);
            // if (!file) throw createError.NotFound("No File");

            const {
                exaid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_pos,
                exa_cat_id,
                exa_cat_desc
            } = req.body;

            const homeCategory = await db.HomeCategory.create({
                exaid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_pos,
                exa_cat_desc,
                exa_cat_image: file.filename,
                exa_cat_status: "Y",
                exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            await db.HomeMasterCategory.create(
                {
                    homecategoryid: homeCategory.exa_cat_id,
                    exa_cat_id: exa_cat_id,
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ message: "Exam Main Category Created" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Home Category : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Home Category By Id
    updateHomeCategoryById: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { file } = req;
            //  console.log(file);
            //  if (!file) throw createError.NotFound("No File");

            let { catId } = req.params;
            if (catId == null) throw createError.BadRequest();

            const {
                exaid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_pos,
                exa_cat_id,
                exa_cat_desc
            } = req.body;

            if (file) {
                const homeCategory = await db.HomeCategory.update(
                    {
                        exaid,
                        exaid_sub,
                        examcat_type,
                        exa_cat_name,
                        exa_cat_slug,
                        exa_cat_pos,
                        exa_cat_desc,
                        exa_cat_image: file.filename,
                        exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        exa_cat_lastupdate: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    },
                    { where: { exa_cat_id: catId } }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                const [created] = await db.HomeMasterCategory.findOrCreate(
                    {
                        where: { homecategoryid: catId },
                        defaults: {
                            homecategoryid: catId,
                            exa_cat_id: exa_cat_id,
                        },
                    }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                if (!created) {
                    await db.HomeMasterCategory.update(
                        {
                            homecategoryid: catId,
                            exa_cat_id: exa_cat_id,
                        },
                        { where: { homecategoryid: catId } }
                    ).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                }

            } else {
                const homeCategory = await db.HomeCategory.update(
                    {
                        exaid,
                        exaid_sub,
                        examcat_type,
                        exa_cat_name,
                        exa_cat_slug,
                        exa_cat_pos,
                        exa_cat_desc,
                        exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        exa_cat_lastupdate: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    },
                    { where: { exa_cat_id: catId } },
                    { transaction: t }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                const [created] = await db.HomeMasterCategory.findOrCreate(
                    {
                        where: { homecategoryid: catId },
                        defaults: {
                            homecategoryid: catId,
                            exa_cat_id: exa_cat_id,
                        },
                    }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                await db.HomeMasterCategory.update(
                    {
                        homecategoryid: catId,
                        exa_cat_id: exa_cat_id,
                    },
                    { where: { homecategoryid: catId } }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            }
            res.send({ message: "Home Exam Main Category Updated" });
            await t.commit();
        } catch (error) {
            logger.error(`Error at Update Home Category : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Status'
    updateInactiveById: async (req, res, next) => {
        try {
            let { catId, status } = req.body;
            if (!catId || !status) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    await db.HomeCategory.update(
                        { exa_cat_status: status },
                        { where: { exa_cat_id: catId } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Home Category Status : ${error.message}`);
            next(error);
        }
    },

    // 7. Update 'Delete'
    updateDeleteById: async (req, res, next) => {
        try {
            let { catId } = req.body;
            if (!catId) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    await db.HomeCategory.update(
                        { exa_cat_status: "D" },
                        { where: { exa_cat_id: catId } },
                        { transaction: t }
                    );
                })
                .then((result) => res.sendStatus(204))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Home Category Delete : ${error.message}`);
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
                    await db.HomeCategory.update(
                        { exa_cat_pos: val.position },
                        { where: { exa_cat_id: val.catId } },
                        { transaction: t }
                    );
                });
            });
            res.send({ message: "Update Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Home Category Position : ${error.message}`);
            next(error);
        }
    },

    // 9. Get All InActive Home Category
    getAllInactiveHomeCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.HomeCategory.findAndCountAll({
                where: { exa_cat_status: "N" },
                order: [["exa_cat_pos"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (!rows) {
                throw createError.NotFound("Home Category Not Found !!!");
            }
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Inactive Home Category : ${error.message}`);
            next(error);
        }
    },

    // 10. Get Home Category By Name
    getHomeCategoryBycategoryName: async (req, res, next) => {
        try {
            let { catName } = req.params;
            if (catName == null) throw createError.BadRequest();

            let category = await db.HomeCategory.findOne({
                where: { exa_cat_name: catName },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (!category) throw createError.NotFound("Home Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Home Category By Name : ${error.message}`);
            next(error);
        }
    },

    // 11. Get Home Category Search Result
    getSearchResult: async (req, res, next) => {
        try {
            let { searchString } = req.body;
            if (searchString == null) throw createError.BadRequest();

            const { count, rows } = await db.HomeCategory.findAndCountAll({
                where: {
                    [Op.or]: [
                        {
                            exa_cat_name: {
                                [Op.like]: "%" + searchString + "%",
                            },
                        },
                        // {
                        //     exa_cat_pos: {
                        //         [Op.like]: "%" + searchString + "%",
                        //     },
                        // },
                    ],
                    exa_cat_status: { [Op.ne]: "D" },
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (count <= 0) throw createError.NotFound("Home Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Home Category Search : ${error.message}`);
            next(error);
        }
    },

    // 12. Get Count Only
    getCountOnly: async (req, res, err) => {
        try {
            let { status } = req.params;
            if (status == null) throw createError.BadRequest();
            let count = 0;
            count = await db.HomeCategory.count({
                where: { exa_cat_status: status },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Home Category Count Only : ${error.message}`);
            next(error);
        }
    },
};
