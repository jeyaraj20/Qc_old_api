const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../helper/schoolLogger");

module.exports = {
    // 1. Create ExamQuestion (Assign)
    createSchoolExamQuestion: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const {
                exam_id,
                sect_id,
                ip_addr,
                qid
            } = req.body;
            if (
                !exam_id ||
                !ip_addr ||
                !qid
            )
                throw createError.BadRequest();
            let Exam = await db.SchoolExams.findOne({
                where: { exam_id: req.body.exam_id, schoolid: req.user.id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            const {

                exam_cat,
                exam_sub,
                exam_name,
                exam_code,
                tot_questions,
                quest_type
            } = Exam;
            const { count } = await db.SchoolExamQuestions.findAndCountAll(
                {
                    where:
                    {
                        exam_id: exam_id,
                        exam_queststatus: 'Y', schoolid: req.user.id
                    }
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            let allowedquestion = tot_questions - count;
            console.log(allowedquestion);
            let examQuestionsList = [];
            let pushedQuestion = 1;


            const { rows } = await db.SchoolQuestions.findAndCountAll(
                {
                    where:
                        { qid: qid, schoolid: req.user.id }
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });



            rows.forEach((index) => {
                if (pushedQuestion <= allowedquestion) {
                    examQuestionsList.push({
                        schoolid: req.user.id,
                        exam_id: exam_id,
                        exam_cat: exam_cat,
                        exam_subcat: exam_sub,
                        sect_id: sect_id,
                        exam_name: exam_name,
                        exam_code: exam_code,
                        quest_type: quest_type,
                        quest_assigned_type: "S",
                        quest_assigned_id: req.user.id,
                        quest_assigned_name: req.user.username,
                        qid: index.qid,
                        cat_id: index.cat_id,
                        sub_id: index.sub_id,
                        q_type: index.q_type,
                        question: index.question,
                        quest_desc: index.quest_desc,
                        opt_type1: index.opt_type1,
                        opt_type2: index.opt_type2,
                        opt_type3: index.opt_type3,
                        opt_type4: index.opt_type4,
                        opt_type5: index.opt_type5,
                        opt_1: index.opt_1,
                        opt_2: index.opt_2,
                        opt_3: index.opt_3,
                        opt_4: index.opt_4,
                        opt_5: index.opt_5,
                        crt_ans: index.crt_ans,
                        quest_level: index.quest_level,
                        exam_questpos: "1",
                        exam_queststatus: "Y",
                        exam_questadd_date: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        ip_addr: ip_addr,
                        last_update: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    });
                    console.log(examQuestionsList);
                }
                pushedQuestion = pushedQuestion + 1;
            });
            await db.SchoolExamQuestions.bulkCreate(examQuestionsList, {
                transaction: t,
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ message: "Exam Updated Success !!!" });
            await t.commit();
        } catch (error) {
            //  await t.rollback();
            logger.error(`Error at Create ExamQuestion (Assign) - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Assigned Question Count
    getAssignedSchoolExamQuestionsCount: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { exam_id, exam_cat, exam_subcat, sect_id, schoolid } = req.body;
            if (!exam_id || !exam_cat || !exam_subcat || !schoolid)
                throw createError.BadRequest();

            const count = await db.SchoolExamQuestions.count(
                { where: { exam_id, exam_cat, exam_subcat, sect_id, schoolid } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Get Assigned Question Count - School : ${error.message}`);
            next(error);
        }
    },

    // 3.
    createSchoolBankExamQuestion: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const {
                exam_id,
                sect_id,
                ip_addr,
                qid
            } = req.body;
            if (
                !exam_id ||
                !ip_addr ||
                !qid
            )
                throw createError.BadRequest();
            let Exam = await db.SchoolExams.findOne({
                where: { exam_id: req.body.exam_id, schoolid: req.user.id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            const {
                exam_cat,
                exam_sub,
                exam_name,
                exam_code,
                tot_questions,
                quest_type
            } = Exam;
            const { count } = await db.SchoolExamQuestions.findAndCountAll(
                {
                    where:
                    {
                        exam_id: exam_id,
                        sect_id: sect_id,
                        exam_queststatus: 'Y', schoolid: req.user.id
                    }
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            let examSection = await db.SchoolExamSectionDetails.findOne({
                where: { sect_id: sect_id, schoolid: req.user.id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const { no_ofquest } = examSection;
            let allowedquestion = no_ofquest - count;
            let examQuestionsList = [];
            let pushedQuestion = 1;


            const { rows } = await db.SchoolQuestions.findAndCountAll(
                {
                    where:
                        //{ qid: qid, schoolid: req.user.id }
                        { qid: qid }
                },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });



            rows.forEach((index) => {
                if (pushedQuestion <= allowedquestion) {
                    examQuestionsList.push({
                        exam_id: exam_id,
                        exam_cat: exam_cat,
                        exam_subcat: exam_sub,
                        sect_id: sect_id,
                        schoolid: req.user.id,
                        exam_name: exam_name,
                        exam_code: exam_code,
                        quest_type: quest_type,
                        quest_assigned_type: "S",
                        quest_assigned_id: req.user.id,
                        quest_assigned_name: req.user.username,
                        qid: index.qid,
                        cat_id: index.cat_id,
                        sub_id: index.sub_id,
                        q_type: index.q_type,
                        question: index.question,
                        quest_desc: index.quest_desc,
                        opt_type1: index.opt_type1,
                        opt_type2: index.opt_type2,
                        opt_type3: index.opt_type3,
                        opt_type4: index.opt_type4,
                        opt_type5: index.opt_type5,
                        opt_1: index.opt_1,
                        opt_2: index.opt_2,
                        opt_3: index.opt_3,
                        opt_4: index.opt_4,
                        opt_5: index.opt_5,
                        crt_ans: index.crt_ans,
                        quest_level: index.quest_level,
                        exam_questpos: "1",
                        exam_queststatus: "Y",
                        exam_questadd_date: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        ip_addr: ip_addr,
                        last_update: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    });
                }
                pushedQuestion = pushedQuestion + 1;
            });
            await db.SchoolExamQuestions.bulkCreate(examQuestionsList, {
                transaction: t,
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ message: "Exam Updated Success !!!" });
            await t.commit();
        } catch (error) {
            //  await t.rollback();
            logger.error(`Error at Create Bank Exam Question - School : ${error.message}`);
            next(error);
        }
    },

    getAssignedSchoolExamQuestions: async (req, res, next) => {
        try {
            const { exam_id, exam_cat, exam_subcat } = req.body;
            if (!exam_id || !exam_cat || !exam_subcat)
                throw createError.BadRequest();

            const [examquestion] = await db.sequelize.query(
                `select 
                    a.*,b.exa_cat_name as 'Category',c.exa_cat_name as 'Subcategory', d.question_code 
                from 
                    tbl__schoolexamquestions as a 
                    inner join tbl__school_exam_category as b on a.exam_cat= b.exa_cat_id
                    inner join tbl__school_exam_category as c on a.exam_subcat= c.exa_cat_id
                    INNER JOIN tbl__schoolquestion as d on d.qid = a.qid 
                where 
                    a.exam_id=${exam_id} and a.exam_cat=${exam_cat} and a.exam_subcat=${exam_subcat} and a.schoolid=${req.user.id} and a.exam_queststatus='Y'
                `
            );
            if (!examquestion)
                throw createError.NotFound("Questions Not Found !!!");
            res.send({ count: examquestion.length, examquestion });

        } catch (error) {
            logger.error(`Error at get Assigned School ExamQuestions - School : ${error.message}`);
            next(error);
        }
    },
    removeAssignedSchoolQuestion: async (req, res, next) => {
        try {
            let { exq_id } = req.body;
            if (!exq_id) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    await db.SchoolExamQuestions.update(
                        { exam_queststatus: 'N' },
                        { where: { exq_id: exq_id, schoolid: req.user.id } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({ message: "Questions removed successfully !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at remove Assigned School Question - School : ${error.message}`);
            next(error);
        }
    },

    getAssignedExamQuestionsCount: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { exam_id, exam_cat, exam_subcat } = req.body;
            if (!exam_id || !exam_cat || !exam_subcat)
                throw createError.BadRequest();

            const count = await db.SchoolExamQuestions.count(
                { where: { exam_id, exam_cat, exam_subcat, exam_queststatus: 'Y', schoolid: req.user.id } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Get Assigned Question Count : ${error.message}`);
            next(error);
        }
    },
};
