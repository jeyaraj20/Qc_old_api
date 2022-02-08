const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const { Op } = require("sequelize");
const next = require("locutus/php/array/next");
const logger = require('../helper/adminLogger')

module.exports = {
    // 1. Get All Active Dashboard
    getAllActiveDashboardCategory: async (req, res, next) => {
        try {
            console.log(req.user);
            const { count, rows } = await db.DashboardCategory.findAndCountAll({
                where: { cat_status: "Y" },
                order: [["cat_pos"]],
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

    // 2. Get Dashboard Category By Id
    getDashboardCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == null) throw createError.BadRequest();
            let category = await db.DashboardCategory.findOne({
                where: {
                    cat_id: catId,
                    cat_status: "Y",
                },
            });
            if (!category) throw createError.NotFound("Home Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Home Category By Id : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Dashboard By Position
    getDashboardCategoryByPosition: async (req, res, next) => {
        try {
            let { position } = req.params;
            if (position < 0) throw createError.BadRequest();

            const { count, rows } = await db.DashboardCategory.findAndCountAll({
                where: {
                    cat_pos: position,
                    cat_status: "Y",
                },
                order: [["cat_name"]],
            });

            if (!rows) throw createError.NotFound("Home Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get Home Category By Position : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Dashboard
    createDashboardCategory: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
           const { file } = req;
           console.log(file);
           if (!file) throw createError.NotFound("No File");
            const {cat_id, cat_name, cat_slug, cat_pos,cat_desc  } = req.body;
            const dashboardCategory = await db.DashboardCategory.create({
                cat_name,
                cat_slug,
                cat_pos,
                cat_desc,
                cat_image: file.filename,
                cat_status: "Y",
                master_ids:"",
                cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
         console.log(dashboardCategory.cat_id)
          const result = await db.DashboardMasterCategory.create( {
               dashboardCategoryid: dashboardCategory.cat_id,
                    cat_id: cat_id,
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
          console.log(result)
            res.send({ message: "Exam Main Category Created" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Home Category : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Dashboard By Id
    updateDashboardCategoryById: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
           const { file } = req;
             console.log(file);
             if (!file) throw createError.NotFound("No File");

            let { catId } = req.params;
            if (catId == null) throw createError.BadRequest();

            const { cat_name, cat_slug, cat_pos, cat_id } = req.body;
            if (file) {
                const dashboardCategory = await db.DashboardCategory.update(
                    {
                        cat_name,
                        cat_slug,
                        cat_pos,
                        cat_image: file.filename,
                        cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        cat_lastupdate: moment(Date.now()).format( "YYYY-MM-DD HH:mm:ss" ),
                    },
                    { where: { cat_id: catId } }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                const [created] = await db.DashboardMasterCategory.findOrCreate(
                    {
                        where: { dashboardCategoryid: catId },
                        defaults: {
                            dashboardCategoryid: catId,
                            cat_id: cat_id,
                        },
                    }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                if (!created) {
                    await db.DashboardMasterCategory.update(
                        {
                            dashboardCategoryid: catId,
                            cat_id: cat_id,
                        },
                        { where: { dashboardCategoryid: catId } }
                    ).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                }

            } else {
                const dashboardCategory = await db.DashboardCategory.update(
                    {
                        cat_name,
                        cat_slug,
                        cat_pos,
                        exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        exa_cat_lastupdate: moment(Date.now()).format( "YYYY-MM-DD HH:mm:ss" ),
                    },
                    { where: { cat_id: catId } },
                    { transaction: t }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                const [created] = await db.DashboardMasterCategory.findOrCreate(
                    {
                        where: { dashboardCategoryid: catId },
                        defaults: {
                            dashboardCategoryid: catId,
                            cat_id: cat_id,
                        },
                    }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                await db.DashboardMasterCategory.update(
                    {
                        dashboardCategoryid: catId,
                        cat_id: cat_id,
                    },
                    { where: { dashboardCategoryid: catId } }
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
               await db.DashboardCategory.update(
                        { cat_status: status },
                        { where: { cat_id: catId } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({result, message: "Update Success !!!" }))
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
            await db.sequelize.transaction(async (t) => {
                    await db.DashboardCategory.update(
                        { cat_status: "D" },
                        { where: { cat_id: catId } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({statusCode: 200, message: "Success !!!"} ))
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
                    await db.DashboardCategory.update(
                        { cat_pos: val.position },
                        { where: { cat_id: val.catId } },
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

    // 9. Get All InActive Dashboard
    getAllInactiveDashboardCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.DashboardCategory.findAndCountAll({
                where: { cat_status: "N" },
                order: [["cat_pos"]],
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

    // 10. Get Dashboard By Name
    getDashboardCategoryBycategoryName: async (req, res, next) => {
        try {
            let { catName } = req.params;
            if (catName == null) throw createError.BadRequest();

            let category = await db.DashboardCategory.findOne({
                where: { cat_name: catName },
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

            const { count, rows } = await db.DashboardCategory.findAndCountAll({
                where: {
                    [Op.or]: [
                        {
                            cat_name: {
                                [Op.like]: "%" + searchString + "%",
                            },
                        },
                    ],
                    cat_status: { [Op.ne]: "D" },
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
            count = await db.DashboardCategory.count({
                where: { cat_status: status },
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
