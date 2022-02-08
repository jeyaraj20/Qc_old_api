const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const { Op } = require("sequelize");
const { is_string } = require("locutus/php/var");
const logger = require('../helper/adminLogger');

module.exports = {
    // 1. Get All Exam Sub Category
    getAllExamSubCategory: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `
                SELECT a.*,b.exa_cat_name AS "category",c.exa_cat_name AS "Mastercategory" , 
                (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='C' and d.exam_status='W') as cWaitingCount,
                (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='C' and d.exam_status='Y') as cActiveCount,
                (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='B' and d.exam_status='W') as bWaitingCount,
                (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='B' and d.exam_status='Y') as bActiveCount,
                (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='D' and d.exam_status='W') as dWaitingCount,
                (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='D' and d.exam_status='Y') as dActiveCount 
                FROM tbl__exam_category AS a
                INNER JOIN tbl__exam_category AS b ON a.exaid_sub=b.exa_cat_id
                INNER JOIN tbl__exam_category AS c ON b.exaid=c.exa_cat_id 
                WHERE a.examcat_type='S' AND a.exa_cat_status=?
            `,
                { replacements: [status, status] }
            );
            if (!category) throw createError.NotFound("Exam Sub Category Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get All Exam Sub Category : ${error.message}`);
            next(error);
        }
    },

    getAllExamSubCategoryChapter: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;
            const { count, rows } = await db.ExamChapters.findAndCountAll({
                where: { chapter_status: "Y", exa_cat_id: exa_cat_id },
                order: [["chapt_id"]],
            });
            if (!rows) throw createError.NotFound("Exam Sub Category Chapter Not Found !!!");
            res.send({ count, chapterrows: rows });
        } catch (error) {
            logger.error(`Error at Get All Exam Sub Category Chapters : ${error.message}`);
            next(error);
        }
    },

    getAllExamSubCategoryTypes: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;

            const { count, rows } = await db.ExamTypes.findAndCountAll({
                where: { extype_status: "Y", exa_cat_id: exa_cat_id },
                order: [["extype_id"]],
            });
            if (!rows) throw createError.NotFound("Exam Sub Category Type Not Found !!!");
            res.send({ count, typerows: rows });
        } catch (error) {
            logger.error(`Error at Get All Exam Sub Category Types : ${error.message}`);
            next(error);
        }
    },

    // 2. Create Exam Sub Category
    createExamSubCategory: async (req, res, next) => {
        try {
            const {
                exaid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_desc,
                chapterList,
                typeList,
                payment_flag
            } = req.body;
            db.sequelize
                .transaction(async (t) => {
                    // 1. tbl__exam_category insert
                    const category = await db.ExamMainCategory.create({
                        exaid,
                        exaid_sub,
                        examcat_type,
                        exa_cat_name,
                        exa_cat_slug,
                        exa_cat_image: "",
                        exa_cat_desc,
                        exa_cat_pos: "0",
                        exa_cat_status: "Y",
                        exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        payment_flag
                    });
                    console.log(category.exa_cat_id);

                    let examChaptersList = [];
                    let examTypesList = [];
                    chapterList.forEach((list) => {
                        examChaptersList.push({
                            exa_cat_id: category.exa_cat_id,
                            exmain_cat: exaid,
                            exsub_cat: exaid_sub,
                            chapter_name: list,
                            chapter_status: "Y",
                            chapter_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            paymentFlag: 'N'
                        });
                    });
                    console.log(examChaptersList);
                    typeList.forEach((type) => {
                        examTypesList.push({
                            exa_cat_id: category.exa_cat_id,
                            exmain_cat: exaid,
                            exsub_cat: exaid_sub,
                            extest_type: type,
                            extype_status: "Y",
                            extype_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        });
                    });
                    console.log(examTypesList);

                    // 2. tbl__examtypes insert
                    await db.ExamTypes.bulkCreate(examTypesList, {
                        transaction: t,
                    });

                    // 3. tbl__examchapters insert
                    await db.ExamChapters.bulkCreate(examChaptersList, {
                        transaction: t,
                    });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ message: "Insert Success" });
        } catch (error) {
            logger.error(`Error at Create Exam Sub Category : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Question By Id
    getExamSubCategoryById: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;
            if (exa_cat_id == 0) throw createError.BadRequest();

            const [category, metadata] = await db.sequelize.query(
                `
                SELECT a.*,b.exa_cat_name AS "category",c.exa_cat_name AS "Master category" 
                FROM tbl__exam_category AS a
                INNER JOIN tbl__exam_category AS b ON a.exaid_sub=b.exa_cat_id
                INNER JOIN tbl__exam_category AS c ON b.exaid=c.exa_cat_id
                WHERE a.examcat_type='S' AND a.exa_cat_status='Y' AND a.exa_cat_id=?
            `,
                { replacements: [exa_cat_id] }
            );

            if (!category) throw createError.NotFound("Exam Sub Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Questions By Id : ${error.message}`);
            next(error);
        }
    },

    getChaptersBySubCatId: async (req, res, next) => {
        try {
            let { subCatIds } = req.body;
            if (subCatIds && subCatIds.length === 0) throw createError.BadRequest();
            const [chapters] = await db.sequelize.query(
                `
                SELECT 
                    C.*,
                    EC.exa_cat_name
                FROM 
                    tbl__examchapters AS C
                    INNER JOIN tbl__exam_category AS EC ON EC.exa_cat_id=C.exa_cat_id
                WHERE
                    C.exa_cat_id IN (${subCatIds.join(',')}) AND C.chapter_status="Y"
                `
            );

            if (!chapters) res.send({ statusCode: 404, message: 'Chapters not found' });
            res.send({ statusCode: 200, message: 'Chapters fetched successfully', chapters });
        } catch (error) {
            logger.error(`Error at Get Sub Category By CatId : ${error.message}`);
            res.send({ statusCode: 500, message: 'Somthing wrong' });
        }
    },

    // 4. Update Question By Id
    updateExamSubCategory: async (req, res, next) => {
        try {
            let { exa_cat_id } = req.params;
            if (exa_cat_id == 0) throw createError.BadRequest();

            const {
                exaid,
                exaid_sub,
                examcat_type,
                exa_cat_name,
                exa_cat_slug,
                exa_cat_desc,
                chapterList,
                delarr,
                typedelarr,
                typeList,
                payment_flag
            } = req.body;
            console.log(delarr);
            console.log(chapterList);
            db.sequelize
                .transaction(async (t) => {
                    // 1. tbl__exam_category update
                    await db.ExamMainCategory.update(
                        {
                            exaid,
                            exaid_sub,
                            examcat_type,
                            exa_cat_name,
                            exa_cat_slug,
                            exa_cat_image: "",
                            exa_cat_desc,
                            // exa_cat_pos: "0",
                            exa_cat_status: "Y",
                            exa_cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            payment_flag
                        },
                        { where: { exa_cat_id } },
                        { transaction: t }
                    );
                    if (delarr.length > 0) {
                        await db.ExamChapters.update({ chapter_status: 'N' }, {
                            where: {
                                chapt_id: {
                                    [Op.in]: delarr
                                }
                            }
                        });
                    }
                    if (typedelarr.length > 0) {
                        await db.ExamTypes.update({ extype_status: 'N' }, {
                            where: {
                                extype_id: {
                                    [Op.in]: typedelarr
                                }
                            }
                        });
                    }

                    let examChaptersList = [];
                    let examTypesList = [];
                    for (let chapter of chapterList) {
                        if (chapter.chaptId != '') {
                            examChaptersList.push({
                                chapt_id: chapter.chaptId,
                                exa_cat_id: exa_cat_id,
                                exmain_cat: exaid,
                                exsub_cat: exaid_sub,
                                chapter_name: chapter.name,
                                chapter_status: "Y",
                                chapter_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                paymentFlag: 'N'
                            });
                        } else {
                            examChaptersList.push({
                                exa_cat_id: exa_cat_id,
                                exmain_cat: exaid,
                                exsub_cat: exaid_sub,
                                chapter_name: chapter.name,
                                chapter_status: "Y",
                                chapter_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                paymentFlag: 'N'
                            });
                        }
                    }
                    console.log(examChaptersList);
                    db.ExamChapters.bulkCreate(examChaptersList, { updateOnDuplicate: ['chapter_name'] });

                    for (let type of typeList) {
                        if (type.typeId != '') {
                            examTypesList.push({
                                extype_id: type.typeId,
                                exa_cat_id: exa_cat_id,
                                exmain_cat: exaid,
                                exsub_cat: exaid_sub,
                                extest_type: type.name,
                                extype_status: "Y",
                                extype_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            });
                        } else {
                            examTypesList.push({
                                exa_cat_id: exa_cat_id,
                                exmain_cat: exaid,
                                exsub_cat: exaid_sub,
                                extest_type: type.name,
                                extype_status: "Y",
                                extype_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            });
                        }
                    }
                    console.log(examTypesList);
                    db.ExamTypes.bulkCreate(examTypesList, { updateOnDuplicate: ['extest_type'] });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ message: "Update Success" });
        } catch (error) {
            logger.error(`Error at Update Questions By Id : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Active / Inactive / Delete'
    updateStatusById: async (req, res, next) => {
        try {
            let { exa_cat_id, status } = req.body;
            if (!exa_cat_id || !status) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    await db.ExamMainCategory.update(
                        { exa_cat_status: status },
                        { where: { exa_cat_id: exa_cat_id } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Exam Sub Category Status : ${error.message}`);
            next(error);
        }
    },

    // 7. Exam Sub Category Search Result
    getSearchResult: async (req, res, next) => {
        try {
            let { searchString, exa_cat_id, status } = req.body;
            if (!!searchString) searchString = `%${searchString}%`;
            let conditions;
            if (!!searchString && !!exa_cat_id) {
                conditions = `a.exa_cat_name like '${searchString}' AND  a.exaid = '${exa_cat_id}'`;
            } else {
                conditions = `a.exa_cat_name like '${searchString}' OR  a.exaid = '${exa_cat_id}'`;
            }
            const [category, metadata] = await db.sequelize.query(
                `
                SELECT a.*,b.exa_cat_name AS "category",c.exa_cat_name AS "Mastercategory" , 
                    (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='C' and d.exam_status='W') as cWaitingCount,
                    (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='C' and d.exam_status='Y') as cActiveCount,
                    (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='B' and d.exam_status='W') as bWaitingCount,
                    (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='B' and d.exam_status='Y') as bActiveCount,
                    (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='D' and d.exam_status='W') as dWaitingCount,
                    (select count(d.exam_id) from tbl__exam AS d where d.exam_sub_sub=a.exa_cat_id and d.exam_type='D' and d.exam_status='Y') as dActiveCount  
                FROM tbl__exam_category AS a
                INNER JOIN tbl__exam_category AS b ON a.exaid_sub=b.exa_cat_id
                INNER JOIN tbl__exam_category AS c ON b.exaid=c.exa_cat_id
                WHERE a.examcat_type='S' AND a.exa_cat_status = ? AND ( ${conditions} )
            `,
                { replacements: [status] }
            );
            if (!category) throw createError.NotFound("Exam Sub Category Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Exam Sub Category Search Result : ${error.message}`);
            next(error);
        }
    },

    // 8. Get Exam Sub Category Count Only
    getExamSubCount: async (req, res, next) => {
        try {
            let { exa_cat_status } = req.params;
            if (exa_cat_status == null) throw createError.BadRequest();
            count = await db.ExamMainCategory.count({
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

    // 9. Exam Sub Category Questions Assign Search Criteria
    questionAssignSearch: async (req, res, next) => {
        try {
            let { pagecount, qType, faculty, searchString,
                exam_id, exam_master_id, exam_cat_id,
                cat_id, sub_id } = req.body;
            //  if (!!searchString) searchString = `%${searchString}%`;
            if (!pagecount || !exam_id || !exam_master_id || !exam_cat_id) throw createError.BadRequest();

            let Exam = await db.Exams.findOne({
                where: { exam_id: exam_id },
            });

            let conditions = ``;

            if (qType != "") {
                conditions = `a.q_type = '${qType}' AND `;
            }
            if (faculty != "") {
                conditions = conditions + `a.quest_add_id = ${faculty} AND `;
            }
            if (searchString != "") {
                conditions = conditions + `a.question LIKE '${searchString}' OR question_code LIKE '${searchString}' AND `;
            }
            if (cat_id != "" && cat_id != 0) {
                conditions = conditions + `a.cat_id = ${cat_id} AND `;
            }
            if (sub_id != "" && sub_id != 0) {
                conditions = conditions + `a.sub_id = ${sub_id} AND `;
            }
            let offset = (pagecount - 1) * 1000;
            const [questions] = await db.sequelize.query(` select a.qid,a.question_code,a.q_type,a.question,a.quest_add_by,a.quest_date,a.quest_level,
        a.quest_status,b.cat_name as 'Category',c.cat_name as 'Subcategory' from tbl__question as a inner join tbl__category as b on a.cat_id= b.cat_id
             inner join tbl__category as c on a.sub_id= c.cat_id 
             where ${conditions} a.quest_level in(${Exam.exam_level}) and  a.quest_status='Y' and a.qid not in
             (select qid from tbl__examquestions where exam_id=? and exam_cat=?
             and exam_subcat=? and exam_queststatus='Y') order by a.qid asc
     limit 1000 OFFSET ${offset}`,
                {
                    replacements: [
                        exam_id,
                        exam_master_id,
                        exam_cat_id
                    ],
                }
            )


            const [questioncount] = await db.sequelize.query(` select count(a.qid) as totalcount from tbl__question as a
             where ${conditions} a.quest_level in(${Exam.exam_level}) and  a.quest_status='Y' 
             and a.qid not in
             (select qid from tbl__examquestions where exam_id=? and exam_cat=?
             and exam_subcat=? and exam_queststatus='Y') `,
                {
                    replacements: [
                        exam_id,
                        exam_master_id,
                        exam_cat_id
                    ],
                }
            )

            if (!questions) throw createError.NotFound("Questions Not Found !!!");
            examQuestionsList = [];
            questions.forEach((row) => {
                examQuestionsList.push(row.qid);
            });

            let questiondata = examQuestionsList.join();
            if (examQuestionsList.length != 0) {
                const [examquestion] = await db.sequelize.query(
                    `select 
                        EQ.qid 
                    from 
                        tbl__examquestions AS EQ
                        JOIN tbl__exam AS E ON E.exam_id=EQ.exam_id AND (E.exam_status='Y' OR E.exam_status='W')
                    where 
                        EQ.exam_id!=? and EQ.exam_queststatus='Y' and EQ.exam_cat=? and EQ.exam_subcat=? and EQ.qid in (`+ questiondata + `)
                    group by 
                        EQ.qid
                    `,
                    {
                        replacements: [
                            exam_id,
                            exam_master_id,
                            exam_cat_id
                        ],
                    }
                );
                res.send({ totalcount: questioncount[0].totalcount, questions, examquestion });
            }
            else {
                let examquestion = [];
                res.send({ totalcount: questioncount[0].totalcount, questions, examquestion });
            }
        } catch (error) {
            logger.error(`Error at Exam Sub Category Questions Assign Search Criteria : ${error.message}`);
            next(error);
        }
    },
};
