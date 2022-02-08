const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/schoolLogger");

module.exports = {
    // 1. Get All Master Category
    getAllSchoolMasterCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.SchoolExamMainCategory.findAndCountAll({
                where: {
                    schoolid: req.user.id,
                    examcat_type: "M",
                    exa_cat_status: "Y",
                    exaid: 0,
                    exaid_sub: 0,

                },
                order: [["exa_cat_pos"]],

            });

            if (!rows)
                throw createError.NotFound(
                    "Exam Master Category Not Found !!!"
                );
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Master Category - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Get All Main Category
    getAllSchoolMainCategory: async (req, res, next) => {
        try {
            const { masterId } = req.params;
            if (!masterId) throw createError.BadRequest();
            const { count, rows } = await db.SchoolExamMainCategory.findAndCountAll({
                where: {
                    examcat_type: "C",
                    exa_cat_status: "Y",
                    exaid: masterId,
                    schoolid: req.user.id,
                    exaid_sub: 0,
                },
                order: [["exa_cat_pos"]],
            });

            if (!rows)
                throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Main Category - School : ${error.message}`);
            next(error);
        }
    },

    getAllSchoolSubCategory: async (req, res, next) => {
        try {
            const { mainId } = req.params;
            if (!mainId) throw createError.BadRequest();
            const { count, rows } = await db.SchoolExamMainCategory.findAndCountAll({
                where: {
                    examcat_type: "S",
                    exa_cat_status: "Y",
                    exaid_sub: mainId,
                    schoolid: req.user.id
                },
                order: [["exa_cat_pos"]],
            });

            if (!rows)
                throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Main Category - School : ${error.message}`);
            next(error);
        }
    },

    // 3. Get All Main Category
    getAllSchoolExamMainCategory: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `
                select a.*,b.exa_cat_name as "MasterName" 
                from tbl__school_exam_category  as a
                left join tbl__school_exam_category as b on a.exaid=b.exa_cat_id
                where a.examcat_type!='S' and a.exa_cat_status=? 
                and a.schoolid=?
            `,
                { replacements: [status, req.user.id] }
            );

            if (!category)
                throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get All Main Category - School : ${error.message}`);
            next(error);
        }
    },
    getAllInactiveSchoolExamMainCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.SchoolExamMainCategory.findAndCountAll({
                where: {
                    examcat_type: "M",
                    exa_cat_status: "N",
                    exaid: 0,
                    exaid_sub: 0,
                    schoolid: req.user.id,
                },
                order: [["exa_cat_pos"]],
            });

            if (!rows)
                throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ count, category: rows });
        } catch (error) {
            logger.error(`Error at Get All Inactive Main Category - School : ${error.message}`);
            next(error);
        }
    },
    getSchoolExamMainCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == null) throw createError.BadRequest();

            let category = await db.SchoolExamMainCategory.findOne({
                where: {
                    exa_cat_id: catId,
                    schoolid: req.user.id,
                    exa_cat_status: "Y",
                },
            });

            if (!category)
                throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Exam Main Category By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Exam Main Category
    createSchoolExamMainCategory: async (req, res, next) => {
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
                qc_exams_id,
                qc_main_category_ids,
                qc_sub_category_ids,
                qc_chapters_ids
            } = req.body;

            await db.SchoolExamMainCategory.create({
                exaid,
                schoolid: req.user.id,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_pos,
                exa_cat_desc,
                exa_cat_image: file.filename,
                qc_exams_id: qc_exams_id,
                qc_main_category_ids: qc_main_category_ids ? qc_main_category_ids : '',
                qc_sub_category_ids: qc_sub_category_ids ? qc_sub_category_ids : '',
                qc_chapters_ids: qc_chapters_ids ? qc_chapters_ids : '',
                exa_cat_status: "Y",
                exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                exa_cat_lastupdate: moment(Date.now()).format(
                    "YYYY-MM-DD HH:mm:ss"
                ),
            })
                .then((message) => res.send({ message }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Create Exam Main Category - School : ${error.message}`);
            next(error);
        }
    },
    updateSchoolExamMainCategoryById: async (req, res, next) => {
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
                qc_exams_id,
                exa_cat_image_url,
                qc_main_category_ids,
                qc_sub_category_ids,
                qc_chapters_ids
            } = req.body;

            await db.SchoolExamMainCategory.update(
                {
                    exaid,
                    schoolid: req.user.id,
                    exaid_sub,
                    examcat_type,
                    exa_cat_name,
                    exa_cat_slug,
                    exa_cat_pos,
                    exa_cat_desc,
                    exa_cat_image: file && file.filename ? file.filename : exa_cat_image_url,
                    qc_exams_id: qc_exams_id,
                    exa_cat_status: "Y",
                    exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    qc_main_category_ids: qc_main_category_ids ? qc_main_category_ids : '',
                    qc_sub_category_ids: qc_sub_category_ids ? qc_sub_category_ids : '',
                    qc_chapters_ids: qc_chapters_ids ? qc_chapters_ids : ''
                },
                { where: { exa_cat_id: catId } }
            )
                .then((response) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Exam Main Category - School : ${error.message}`);
            next(error);
        }
    },
    updateSchoolInactiveById: async (req, res, next) => {
        try {
            await db.sequelize.transaction(async (t) => {
                let { catId, status } = req.body;
                if (!catId || !status) throw createError.BadRequest();

                await db.SchoolExamMainCategory.update(
                    { exa_cat_status: status },
                    { where: { exa_cat_id: catId } },
                    { transaction: t }
                )
                    .then((response) =>
                        res.send({ message: "Update Success !!!" })
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Exam Main Category - School : ${error.message}`);
            next(error);
        }
    },

    // 7. Update 'Position'
    updateSchoolPositionById: async (req, res, next) => {
        try {
            const { values } = req.body;
            if (!values) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                values.forEach(async (val) => {
                    await db.SchoolExamMainCategory.update(
                        { exa_cat_pos: val.position },
                        { where: { exa_cat_id: val.catId } },
                        { transaction: t }
                    );
                });
            });
            res.send({ message: "Update Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Exam Main Category Position - School : ${error.message}`);
            next(error);
        }
    },

    getAllExamChapters: async (req, res, next) => {
        try {
            const { subId } = req.params;
            if (!subId) throw createError.BadRequest();
            const { count, rows } = await db.SchoolExamChapters.findAndCountAll({
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

