const db = require("../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/adminLogger");

module.exports = {
    // 1. Get All Master Category
    getAllMasterCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.ExamMainCategory.findAndCountAll({
                where: {
                    examcat_type: "M",
                    exa_cat_status: "Y",
                    exaid: 0,
                    exaid_sub: 0,
                },
                order: [["exa_cat_name", "ASC"]],
            });

            if (!rows) throw createError.NotFound("Exam Master Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Master Category : ${error.message}`);
            next(error);
        }
    },

    // 2. Get All Main Category
    getAllMainCategory: async (req, res, next) => {
        try {
            const { masterId } = req.params;
            if (!masterId) throw createError.BadRequest();
            const { count, rows } = await db.ExamMainCategory.findAndCountAll({
                where: {
                    examcat_type: "C",
                    exa_cat_status: "Y",
                    exaid: masterId,
                    exaid_sub: 0,
                },
                order: [["exa_cat_pos"]],
            });

            if (!rows) throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Exam Main Category : ${error.message}`);
            next(error);
        }
    },

    getAllSubCategory: async (req, res, next) => {
        try {
            const { catId } = req.params;
            if (!catId) throw createError.BadRequest();
            const { count, rows } = await db.ExamMainCategory.findAndCountAll({
                where: {
                    examcat_type: "S",
                    exa_cat_status: "Y",
                    exaid_sub: catId,
                },
                order: [["exa_cat_pos"]],
            });

            if (!rows) throw createError.NotFound("Exam sub Category Not Found !!!");
            res.send({ count, subcategory: rows });
        } catch (error) {
            logger.error(`Error at Get All Exam Sub Category : ${error.message}`);
            next(error);
        }
    },

    // 3. Get All Main Category
    getAllExamMainCategory: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `
                    select 
                        a.*,
                        b.exa_cat_name as "MasterName", 
                        c.exa_rating as exa_rating, 
                        c.exa_icon_image as exa_icon_image 
                    from 
                        tbl__exam_category as a
                        left join tbl__exam_category as b on a.exaid=b.exa_cat_id
                        left join tbl__exam_ratings as c on a.exa_cat_id=c.exa_cat_id
                    where 
                        a.examcat_type!='S' and a.exa_cat_status='${status}'
                    GROUP BY
                    	a.exa_cat_id
                `
            );

            if (!category) throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get All Main Category : ${error.message}`);
            next(error);
        }
    },

    getAllInactiveExamMainCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.ExamMainCategory.findAndCountAll({
                where: {
                    examcat_type: "M",
                    exa_cat_status: "N",
                    exaid: 0,
                    exaid_sub: 0,
                },
                order: [["exa_cat_pos"]],
            });

            if (!rows) throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Inactive Exam Main Category : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Exam Main Category By Id
    getExamMainCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == null) throw createError.BadRequest();

            let category = await db.ExamMainCategory.findOne({
                where: {
                    exa_cat_id: catId,
                    exa_cat_status: "Y",
                },
            });

            if (!category) throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Exam Main Category Id: ${error.message}`);
            next(error);
        }
    },

    // 3. Get Exam Main Category By Position
    getExamMainCategoryByPosition: async (req, res, next) => {
        try {
            let { position } = req.params;
            if (position == null) throw createError.BadRequest();

            let category = await db.ExamMainCategory.findAll({
                where: {
                    exa_cat_pos: position,
                    exa_cat_status: "Y",
                },
                order: [["exa_cat_name"]],
            });

            if (!category) throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Exam Main Category Position: ${error.message}`);
            next(error);
        }
    },

    // 4. Create Exam Main Category
    createExamMainCategory: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { file } = req;
            if (!file) throw createError.NotFound("No File");

            const {
                exaid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_pos,
                exa_cat_desc,
                payment_flag,
                isAttachment,
                attachmentUrl,
                attachmentFileName
            } = req.body;

            const examMainCategory = await db.ExamMainCategory.create(
                {
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
                    payment_flag,
                    isAttachment,
                    attachmentUrl: attachmentUrl ? attachmentUrl : '',
                    attachmentFileName: attachmentFileName ? attachmentFileName : ''
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            await db.ExamRatings.create(
                {
                    examcat_type,
                    exa_cat_id: examMainCategory.exa_cat_id,
                    exa_icon_image: req.body.exa_icon_image,
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            res.send({ message: "Exam Main Category Created" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Exam Main Category : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Exam Main Category By Id
    updateExamMainCategoryById: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { file } = req;

            let { catId } = req.params;
            if (catId == null) throw createError.BadRequest();

            const {
                exaid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_pos,
                exa_cat_desc,
                exa_rating,
                exa_icon_image,
                payment_flag,
                isAttachment,
                attachmentUrl,
                attachmentFileName,
                exa_cat_image_url
            } = req.body;

            await db.ExamMainCategory.update(
                {
                    exaid,
                    exaid_sub,
                    examcat_type,
                    exa_cat_name,
                    exa_cat_slug,
                    exa_cat_pos,
                    exa_cat_desc,
                    exa_cat_image: file && file.filename ? file.filename : exa_cat_image_url,
                    //exa_cat_status: "Y",
                    exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    payment_flag,
                    isAttachment,
                    attachmentUrl: attachmentUrl && isAttachment === "Y" ? attachmentUrl : '',
                    attachmentFileName: attachmentFileName && isAttachment === "Y" ? attachmentFileName : ''
                },
                { where: { exa_cat_id: catId } }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const [examRating, created] = await db.ExamRatings.findOrCreate({
                where: { exa_cat_id: catId, examcat_type },
                defaults: {
                    examcat_type,
                    exa_cat_id: catId,
                    exa_rating: exa_rating ? exa_rating : "",
                    exa_icon_image: exa_icon_image ? exa_icon_image : "",
                    transaction: t,
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (!created) {
                await db.ExamRatings.update(
                    {
                        exa_rating: exa_rating ? exa_rating : "",
                        exa_icon_image: exa_icon_image ? exa_icon_image : "",
                    },
                    { where: { exa_cat_id: catId } }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            }

            res.send({ message: "Update Success !!!" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Update Exam Main Category : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Active / Inactive / Delete'
    updateInactiveById: async (req, res, next) => {
        try {
            await db.sequelize.transaction(async (t) => {
                let { catId, status } = req.body;
                if (!catId || !status) throw createError.BadRequest();

                await db.ExamMainCategory.update(
                    { exa_cat_status: status },
                    { where: { exa_cat_id: catId } },
                    { transaction: t }
                )
                    .then((response) => res.send({ message: "Update Success !!!" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Exam Main Category Status : ${error.message}`);
            next(error);
        }
    },

    // 7. Update 'Position'
    updatePositionById: async (req, res, next) => {
        try {
            const { values } = req.body;
            if (!values) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                values.forEach(async (val) => {
                    await db.ExamMainCategory.update(
                        { exa_cat_pos: val.position },
                        { where: { exa_cat_id: val.catId } },
                        { transaction: t }
                    );
                });
            });
            res.send({ message: "Update Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Exam Main Category Position : ${error.message}`);
            next(error);
        }
    },

    // 7. Update 'Position'
    bulkUpdateMasterCat: async (req, res, next) => {
        try {
            const { masterCategory } = req.body;
            console.log(masterCategory, "masterCategory")
            if (masterCategory && masterCategory.length > 0) {
                await db.sequelize.transaction(async (t) => {
                    masterCategory.forEach(async (val) => {
                        console.log(val, 'dckndcjdjcdjcndj')
                        let result = await db.ExamMainCategory.update(
                            {
                                isPopular: val.isPopular ? true : false,
                                isTrending: val.isTrending ? true : false
                            },
                            { where: { exa_cat_id: val.exa_cat_id } },
                            { transaction: t }
                        );
                        console.log(result, 'dckmdnjcbdjcnjdnc')
                    });
                });
                res.send({ statusCode: 200, message: "Update Success !!!" });
            } else {
                res.send({ statusCode: 201, message: "Category Empty" });
            }
        } catch (error) {
            logger.error(`Error at Update Exam Main Category Position : ${error.message}`);
            res.send({ statusCode: 201, message: 'Somthing Wrong' });
        }
    },

    // Count Only
    getExamMainCount: async (req, res, next) => {
        try {
            let { exa_cat_status } = req.params;
            if (exa_cat_status == null) throw createError.BadRequest();
            count = await db.ExamMainCategory.count({
                where: { exa_cat_status, examcat_type: { [Op.ne]: "S" } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Exam Main Category Count : ${error.message}`);
            next(error);
        }
    },

    getHomeMasterCategory: async (req, res, next) => {
        try {
            const { exacatid } = req.params;
            if (!exacatid) throw createError.BadRequest();
            const { count, rows } = await db.HomeMasterCategory.findAndCountAll({
                where: {
                    homecategoryid: exacatid
                },
            });

            if (!rows) throw createError.NotFound("Home Exam Master Category Not Found !!!");
            res.send({ count, mastercategory: rows });
        } catch (error) {
            logger.error(`Error at Get All Home Exam Master Category : ${error.message}`);
            next(error);
        }
    },

    getAllExamChapters: async (req, res, next) => {
        try {
            const { subId } = req.params;
            if (!subId) throw createError.BadRequest();
            const { count, rows } = await db.ExamChapters.findAndCountAll({
                where: {
                    chapter_status: "Y",
                    exa_cat_id: subId,
                },
                order: [["chapt_id"]],
            });

            if (!rows) throw createError.NotFound("Exam sub Category Not Found !!!");
            res.send({ count, chapters: rows });
        } catch (error) {
            logger.error(`Error at Get All Exam Sub Category : ${error.message}`);
            next(error);
        }
    },
};
