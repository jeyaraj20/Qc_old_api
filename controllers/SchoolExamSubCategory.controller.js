const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const { Op } = require("sequelize");
const logger = require("../helper/schoolLogger");

module.exports = {
    // 1. Get All Exam Sub Category
    getAllSchoolExamSubCategory: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `
                SELECT a.*,b.exa_cat_name AS "category",c.exa_cat_name AS "Mastercategory" , 
                (select count(d.exam_id) from tbl__schoolexam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='C' and d.schoolid=${req.user.id}  and d.exam_status='W') as cWaitingCount,
                (select count(d.exam_id) from tbl__schoolexam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='C' and d.schoolid=${req.user.id}  and d.exam_status='Y') as cActiveCount,
                (select count(d.exam_id) from tbl__schoolexam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='B' and d.schoolid=${req.user.id}  and d.exam_status='W') as bWaitingCount,
                (select count(d.exam_id) from tbl__schoolexam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='B' and d.schoolid=${req.user.id}  and d.exam_status='Y') as bActiveCount 
                FROM tbl__school_exam_category AS a
                INNER JOIN tbl__school_exam_category AS b ON a.exaid_sub=b.exa_cat_id
                INNER JOIN tbl__school_exam_category AS c ON b.exaid=c.exa_cat_id
                WHERE a.examcat_type='S' and a.exa_cat_status=? and a.schoolid=?
            `,
                { replacements: [status, req.user.id] }
            );
            if (!category)
                throw createError.NotFound("Exam Sub Category Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get All Exam Sub Category - School : ${error.message}`);
            next(error);
        }
    },

    getAllSchoolExamSubCategoryChapter: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;
            const { count, rows } = await db.SchoolExamChapters.findAndCountAll({
                where: { chapter_status: "Y", exa_cat_id: exa_cat_id, schoolid: req.user.id },
                order: [["chapt_id"]],
            });
            if (!rows)
                throw createError.NotFound("Exam Sub Category Chapter Not Found !!!");
            res.send({ count, chapterrows: rows });
        } catch (error) {
            logger.error(`Error at get All School Exam SubCategory Chapter - School : ${error.message}`);
            next(error);
        }
    },

    getAllSchoolExamSubCategoryTypes: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;

            const { count, rows } = await db.SchoolExamTypes.findAndCountAll({
                where: { extype_status: "Y", exa_cat_id: exa_cat_id, schoolid: req.user.id },
                order: [["extype_id"]],
            });
            if (!rows)
                throw createError.NotFound("Exam Sub Category Type Not Found !!!");
            res.send({ count, typerows: rows });
        } catch (error) {
            logger.error(`Error at get All School Exam SubCategory Types - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Create Exam Sub Category
    createSchoolExamSubCategory: async (req, res, next) => {
        try {
            const {
                exaid,
                schoolid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_desc,
                chapterList,
                typeList,
            } = req.body;
            db.sequelize
                .transaction(async (t) => {
                    // 1. tbl__exam_category insert
                    const category = await db.SchoolExamMainCategory.create({
                        exaid,
                        schoolid: req.user.id,
                        exaid_sub,
                        examcat_type,
                        exa_cat_name,
                        exa_cat_slug,
                        exa_cat_image: "",
                        exa_cat_desc,
                        exa_cat_pos: "0",
                        exa_cat_status: "Y",
                        exa_cat_dt: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        exa_cat_lastupdate: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    });
                    console.log(category.exa_cat_id);

                    let examChaptersList = [];
                    let examTypesList = [];
                    chapterList.forEach((list) => {
                        examChaptersList.push({
                            exa_cat_id: category.exa_cat_id,
                            exmain_cat: exaid,
                            schoolid: req.user.id,
                            exsub_cat: exaid_sub,
                            chapter_name: list,
                            chapter_status: "Y",
                            chapter_date: moment(Date.now()).format(
                                "YYYY-MM-DD HH:mm:ss"
                            ),
                            lastupdate: moment(Date.now()).format(
                                "YYYY-MM-DD HH:mm:ss"
                            ),
                        });
                    });
                    console.log(examChaptersList);
                    typeList.forEach((type) => {
                        examTypesList.push({
                            exa_cat_id: category.exa_cat_id,
                            exmain_cat: exaid,
                            schoolid: req.user.id,
                            exsub_cat: exaid_sub,
                            extest_type: type,
                            extype_status: "Y",
                            extype_date: moment(Date.now()).format(
                                "YYYY-MM-DD HH:mm:ss"
                            ),
                            lastupdate: moment(Date.now()).format(
                                "YYYY-MM-DD HH:mm:ss"
                            ),
                        });
                    });
                    console.log(examTypesList);

                    // 2. tbl__examtypes insert
                    await db.SchoolExamTypes.bulkCreate(examTypesList, {
                        transaction: t,
                    });

                    // 3. tbl__examchapters insert
                    await db.SchoolExamChapters.bulkCreate(examChaptersList, {
                        transaction: t,
                    });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ message: "Insert Success" });
        } catch (error) {
            logger.error(`Error at Create Exam Sub Category - School : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Question By Id
    getSchoolExamSubCategoryById: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;
            if (exa_cat_id == 0) throw createError.BadRequest();

            const [category, metadata] = await db.sequelize.query(
                `
                SELECT a.*,b.exa_cat_name AS "category",c.exa_cat_name AS "Master category" 
                FROM tbl__school_exam_category AS a
                INNER JOIN tbl__school_exam_category AS b ON a.exaid_sub=b.exa_cat_id
                INNER JOIN tbl__school_exam_category AS c ON b.exaid=c.exa_cat_id
                WHERE a.examcat_type='S' AND a.exa_cat_status='Y' AND a.schoolid=${req.user.id} AND a.exa_cat_id=?
            `,
                { replacements: [exa_cat_id] }
            );

            if (!category)
                throw createError.NotFound("Exam Sub Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Question By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Update Question By Id
    updateSchoolExamSubCategory: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;
            if (exa_cat_id == 0) throw createError.BadRequest();

            const {
                exaid,
                schoolid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_desc,
                chapterList,
                delarr,
                typedelarr,
                typeList,
            } = req.body;
            db.sequelize
                .transaction(async (t) => {
                    // 1. tbl__exam_category update
                    await db.SchoolExamMainCategory.update(
                        {
                            exaid,
                            schoolid,
                            exaid_sub,
                            examcat_type,
                            exa_cat_name,
                            exa_cat_slug,
                            exa_cat_image: "",
                            exa_cat_desc,
                            exa_cat_pos: "0",
                            exa_cat_status: "Y",
                            exa_cat_dt: moment(Date.now()).format(
                                "YYYY-MM-DD HH:mm:ss"
                            ),
                            exa_cat_lastupdate: moment(Date.now()).format(
                                "YYYY-MM-DD HH:mm:ss"
                            ),
                        },
                        { where: { exa_cat_id, schoolid: req.user.id } },
                        { transaction: t }
                    );
                    if (delarr.length > 0) {
                        await db.SchoolExamChapters.update({ chapter_status: 'N' }, {
                            where: {
                                chapt_id: {
                                    [Op.in]: delarr
                                },
                                schoolid: req.user.id
                            }
                        });
                    }
                    if (typedelarr.length > 0) {
                        await db.SchoolExamTypes.update({ extype_status: 'N' }, {
                            where: {
                                extype_id: {
                                    [Op.in]: typedelarr
                                },
                                schoolid: req.user.id
                            }
                        });
                    }

                    let examChaptersList = [];
                    let examTypesList = [];
                    for (let chapter of chapterList) {
                        examChaptersList.push({
                            chapt_id: chapter.chaptId,
                            exa_cat_id: exa_cat_id,
                            schoolid: req.user.id,
                            exmain_cat: exaid,
                            exsub_cat: exaid_sub,
                            chapter_name: chapter.name,
                            chapter_status: "Y",
                            chapter_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        });
                    }
                    console.log(examChaptersList);
                    db.SchoolExamChapters.bulkCreate(examChaptersList, { updateOnDuplicate: ['chapter_name'] });

                    for (let type of typeList) {
                        examTypesList.push({
                            extype_id: type.typeId,
                            exa_cat_id: exa_cat_id,
                            schoolid: req.user.id,
                            exmain_cat: exaid,
                            exsub_cat: exaid_sub,
                            extest_type: type.name,
                            extype_status: "Y",
                            extype_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        });
                    }
                    console.log(examTypesList);
                    db.SchoolExamTypes.bulkCreate(examTypesList, { updateOnDuplicate: ['extest_type'] });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ message: "Update Success" });
        } catch (error) {
            logger.error(`Error at Update Question By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Active / Inactive / Delete'
    updateSchoolStatusById: async (req, res, next) => {
        try {
            let { exa_cat_id, status } = req.body;
            if (!exa_cat_id || !status) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    await db.SchoolExamMainCategory.update(
                        { exa_cat_status: status },
                        { where: { exa_cat_id: exa_cat_id, schoolid: req.user.id } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Question Status - School : ${error.message}`);
            next(error);
        }
    },

    getExamSubCount: async (req, res, next) => {
        try {
            let { exa_cat_status } = req.params;
            if (exa_cat_status == null) throw createError.BadRequest();
            count = await db.SchoolExamMainCategory.count({
                where: { exa_cat_status, examcat_type: "S", exaid_sub: { [Op.ne]: 0 } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get Exam Sub Category Count Only : ${error.message}`);
            next(error);
        }
    },
};
