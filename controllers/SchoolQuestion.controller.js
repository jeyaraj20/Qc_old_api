const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const { ImageFilter } = require("../helper/general_helper");
const logger = require("../helper/schoolLogger");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var homeCategoryDir = path.join(process.env.schoolQuestions);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.schoolQuestions);
    },
    filename: (req, file, callBack) => {
        if (
            req.opt_type1 == "T" ||
            req.opt_type2 == "T" ||
            req.opt_type3 == "T" ||
            req.opt_type4 == "T" ||
            req.opt_type5 == "T"
        ) {
            return;
        } else {
            callBack(
                null,
                `file-${Date.now()}${path.extname(file.originalname)}`
            );
        }
    },
});

const upload = multer({
    storage: storage,
    fileFilter: ImageFilter,
    limits: { fileSize: "2mb" },
}).fields([{
        name: "question",
        maxCount: 1,
    },
    {
        name: "opt_1",
        maxCount: 1,
    },
    {
        name: "opt_2",
        maxCount: 1,
    },
    {
        name: "opt_3",
        maxCount: 1,
    },
    {
        name: "opt_4",
        maxCount: 1,
    },
    {
        name: "opt_5",
        maxCount: 1,
    },
]);

//-------------------------- Multer Part End ---------------------------------------//


module.exports = {
    // 1. Get All Active Question
    getAllSchoolQuestion: async(req, res, next) => {
        try {
            let { status, cat_id, sub_id } = req.body;
            if (!status || !cat_id || !sub_id) throw createError.BadRequest();

            const { count, rows } = await db.SchoolQuestions.findAndCountAll({
                where: { quest_status: status, cat_id, sub_id, schoolid: req.user.id },
            });

            if (!rows) {
                throw createError.NotFound("Question Not Found !!!");
            }
            res.send({ count, questions: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Question - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Get All Active Question
    getSchoolQuestionByCategories: async(req, res, next) => {
        try {
            let { sub_id } = req.params;
            if (sub_id == 0) throw createError.BadRequest();

            const { count, rows } = await db.SchoolQuestions.findAndCountAll({
                where: { sub_id: sub_id, schoolid: req.user.id },
            });

            if (!rows) {
                throw createError.NotFound("Question Not Found !!!");
            }
            res.send({ count, questions: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Question - School : ${error.message}`);
            next(error);
        }
    },
    // 3. Create Question
    createSchoolQuestion: async(req, res, next) => {
        try {
            let question_code;
            upload(req, res, function(err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }

                // req.file contains information of uploaded file
                // req.body contains information of text fields, if there were any
                const {
                    cat_id,
                    sub_id,
                    q_type,
                    question,
                    quest_desc,
                    opt_type1,
                    opt_1,
                    opt_type2,
                    opt_type3,
                    opt_type4,
                    opt_type5,
                    opt_2,
                    opt_3,
                    opt_4,
                    opt_5,
                    crt_ans,
                    quest_level,
                    quest_pos,
                    quest_ipaddr,
                } = req.body;
                console.log(req.body);
                //const { id, name, type } = req.user;
                console.log(req.user);
                getSchoolQuestionNumber(cat_id, sub_id, req.user.id)
                    .then(
                        (res) => {
                            db.SchoolQuestions.create({
                                cat_id,
                                sub_id,
                                schoolid: req.user.id,
                                quest_add_type: "A", //type,
                                q_type,
                                question: q_type == "I" ?
                                    req.files.question[0].filename :
                                    question,
                                question_code: res,
                                quest_desc,
                                opt_type1,
                                opt_1: opt_type1 == "I" ?
                                    req.files.opt_1[0].filename :
                                    opt_1,
                                opt_type2,
                                opt_type3,
                                opt_type4,
                                opt_type5,
                                opt_2: opt_type2 == "I" ?
                                    req.files.opt_2[0].filename :
                                    opt_2,
                                opt_3: opt_type3 == "I" ?
                                    req.files.opt_3[0].filename :
                                    opt_3,
                                opt_4: opt_type4 == "I" ?
                                    req.files.opt_4[0].filename :
                                    opt_4,
                                opt_5: opt_type5 == "I" ?
                                    req.files.opt_5[0].filename :
                                    opt_5,
                                crt_ans,
                                quest_level,
                                quest_add_id: req.user.id, //id,
                                quest_add_by: req.user.username, //name,
                                quest_pos,
                                quest_status: "Y", //type == "A" ? "Y" : "W",
                                quest_date: moment(Date.now()).format(
                                    "YYYY-MM-DD HH:mm:ss"
                                ),
                                aproved_date: moment(Date.now()).format(
                                    "YYYY-MM-DD HH:mm:ss"
                                ),
                                quest_ipaddr,
                                lastupdate: moment(Date.now()).format(
                                    "YYYY-MM-DD HH:mm:ss"
                                ),
                            }).then((message) => console.log(message));
                        },
                        (err) => {
                            throw createError.InternalServerError(err.message);
                        }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                res.send({ message: "Insert Success" });
            });
        } catch (error) {
            logger.error(`Error at Create Question - School : ${error.message}`);
            next(error);
        }
    },
    getSchoolQuestionById: async(req, res, next) => {
        try {
            let { qId } = req.params;
            if (qId == 0) throw createError.BadRequest();

            let question = await db.SchoolQuestions.findOne({
                where: {
                    qid: qId,
                    schoolid: req.user.id,
                    quest_status: "Y",
                },
            });

            if (!question) throw createError.NotFound("Question Not Found !!!");
            res.send({ question });
        } catch (error) {
            logger.error(`Error at Get Question By Id - School : ${error.message}`);
            next(error);
        }
    },

    getAllocateSchoolQuestion: async(req, res, next) => {
        try {
            let { pagecount, exam_id, exam_master_id, exam_cat_id } = req.body;
            if (!pagecount || !exam_id || !exam_master_id || !exam_cat_id)
                throw createError.BadRequest();

            let Exam;
            Exam = await db.Exams.findOne({
                where: { exam_id: exam_id },
            });
            if(!Exam){
                Exam = await db.SchoolExams.findOne({
                    where: { exam_id: exam_id },
                });
            }

            let offset = (pagecount - 1) * 1000;
            const [question] = await db.sequelize.query(
                ` select a.qid,a.q_type,a.question,a.quest_add_by,a.quest_date,a.quest_level,
           a.quest_status,a.question_code
              ,b.cat_name as 'Category',c.cat_name as 'Subcategory' from tbl__schoolquestion as a
		    inner join tbl__school_question_category as b on a.cat_id= b.cat_id
                inner join tbl__school_question_category as c on a.sub_id= c.cat_id 
                where a.quest_level in(` +
                Exam.exam_level +
                `) and a.quest_status='Y' and a.schoolid = ? and a.qid not in
                (select qid from tbl__schoolexamquestions where exam_id=? and exam_cat=?
                and exam_subcat=? and exam_queststatus='Y' and schoolid = ?) order by a.qid desc
		limit 1000 OFFSET ${offset}`, {
                    replacements: [req.user.id, exam_id, exam_master_id, exam_cat_id, req.user.id],
                }
            );

            examQuestionsList = [];
            question.forEach((row) => {
                examQuestionsList.push(row.qid);
            });

            if (!question) throw createError.NotFound("Questions Not Found !!!");

            let questiondata = examQuestionsList.join();
            if (examQuestionsList.length != 0) {
                const [examquestion] = await db.sequelize.query(
                    ` select qid from tbl__schoolexamquestions where exam_id!=? 
                    and exam_queststatus='Y' and exam_cat=?
                    and exam_subcat=? and schoolid = ?
                    and qid in (` +
                    questiondata +
                    `)
                    group by qid
                    `, {
                        replacements: [exam_id, exam_master_id, exam_cat_id, req.user.id],
                    }
                );
                res.send({ count: question.length, question, examquestion });
            } else {
                let examquestion = [];
                res.send({ count: question.length, question, examquestion });
            }
        } catch (error) {
            logger.error(`Error at get Allocate School Question - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Update Question By Id
    updateSchoolQuestionById: async(req, res, next) => {
        try {
            upload(req, res, function(err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }

                // req.file contains information of uploaded file
                // req.body contains information of text fields, if there were any
                let { qId } = req.params;
                if (qId == 0) throw createError.BadRequest();

                const {
                    cat_id,
                    sub_id,
                    schoolid,
                    q_type,
                    question,
                    question_code,
                    quest_desc,
                    opt_type1,
                    opt_1,
                    opt_type2,
                    opt_type3,
                    opt_type4,
                    opt_type5,
                    opt_2,
                    opt_3,
                    opt_4,
                    opt_5,
                    crt_ans,
                    quest_level,
                    quest_pos,
                    quest_ipaddr,
                } = req.body;
                console.log(req.body);
                //const { id, name, type } = req.user;
                console.log(req.user);

                db.SchoolQuestions.update({
                        cat_id,
                        sub_id,
                        schoolid,
                        quest_add_type: "A", //type,
                        q_type,
                        question: q_type == "I" ?
                            req.files.question[0].filename :
                            question,
                        question_code,
                        quest_desc,
                        opt_type1,
                        opt_1: opt_type1 == "I" ? req.files.opt_1[0].path : opt_1,
                        opt_type2,
                        opt_type3,
                        opt_type4,
                        opt_type5,
                        opt_2: opt_type2 == "I" ?
                            req.files.opt_2[0].filename :
                            opt_2,
                        opt_3: opt_type3 == "I" ?
                            req.files.opt_3[0].filename :
                            opt_3,
                        opt_4: opt_type4 == "I" ?
                            req.files.opt_4[0].filename :
                            opt_4,
                        opt_5: opt_type5 == "I" ?
                            req.files.opt_5[0].filename :
                            opt_5,
                        crt_ans,
                        quest_level,
                        quest_add_id: req.user.id, //id,
                        quest_add_by: req.user.username, //name,
                        quest_pos,
                        quest_status: "Y", //type == "A" ? "Y" : "W",
                        quest_date: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        aproved_date: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        quest_ipaddr,
                        lastupdate: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    }, { where: { qid: qId, schoolid: req.user.id } })
                    .then((message) =>
                        res.send({ message: "Update Success !!!" })
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Question By Id - School : ${error.message}`);
            next(error);
        }
    },
    // 5. Question Number
    getSchoolQuestionNo: async(req, res, next) => {
        try {
            const { cat_id, sub_id } = req.body;
            if (!cat_id || !sub_id) throw createError.BadRequest();

            let count = 0;
            let catCode = "";

            await db.sequelize.transaction(async(t) => {
                await db.SchoolQuestions.count({ where: { cat_id, sub_id, schoolid: req.user.id } }, { transaction: t }).then((counts) => {
                    count = counts;
                });

                await db.SchoolQuestionCategory.findOne({
                    attributes: ["cat_code"],
                    where: {
                        cat_id: sub_id,
                        pid: cat_id,
                        schoolid: req.user.id,
                    },
                }, { transaction: t }).then((result) => {
                    catCode = result.cat_code;
                });
            });
            //console.log(catCode + (count + 1).toString().padStart(4, "0"));
            res.send({
                questionNo: catCode + (count + 1).toString().padStart(4, "0"),
            });
        } catch (error) {
            logger.error(`Error at Question Number - School : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Active / Inactive / Delete'
    updateSchoolStatusById: async(req, res, next) => {
        try {
            let { qid, status } = req.body;
            if (!qid || !status) throw createError.BadRequest();

            await db.sequelize
                .transaction(async(t) => {
                    await db.SchoolQuestions.update({ quest_status: status }, { where: { qid: qid, schoolid: req.user.id } }, { transaction: t });
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
    // 7. Get Dashboard Count
    getSchoolQuestionsCount: async(req, res, next) => {
        try {
            const count = await db.SchoolQuestions.count({
                where: { quest_status: "Y", schoolid: req.user.id },
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get Dashboard Count - School : ${error.message}`);
            next(error);
        }
    },

    // 8. Get Questions Count Only
    getSchoolQuestionsCountOnly: async(req, res, next) => {
        try {
            let { quest_status, sub_id, cat_id } = req.body;
            if (!quest_status || !sub_id || !cat_id) throw createError.BadRequest();
            let count = 0;
            // quest_add_id: req.user.id,
            // Add this to where quest_add_id
            count = await db.SchoolQuestions.count({ where: { quest_status, sub_id, cat_id, schoolid: req.user.id } }).catch(
                (err) => {
                    throw createError.InternalServerError(err.message);
                }
            );
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get Questions Count Only : ${error.message}`);
            next(error);
        }
    },

    getAllocateQuestionTotalCount: async(req, res, next) => {
        try {
            let { exam_id, exam_master_id, exam_cat_id } = req.body;
            if (!exam_id || !exam_master_id || !exam_cat_id) throw createError.BadRequest();

            let Exam = await db.SchoolExams.findOne({
                where: { exam_id: exam_id, schoolid: req.user.id },
            });
            const [question] = await db.sequelize.query(
                ` select count(a.qid) as totalcount from tbl__schoolquestion as a
                where a.quest_level in(` +
                Exam.exam_level +
                `) and a.quest_status='Y' and a.schoolid = ? and a.qid not in
                (select qid from tbl__examquestions where exam_id=? and exam_cat=?
                and exam_subcat=? and exam_queststatus='Y' and schoolid = ?)
                `, {
                    replacements: [req.user.id, exam_id, exam_master_id, exam_cat_id, req.user.schoolId],
                }
            );
            res.send({ totalcount: question[0].totalcount });
        } catch (error) {
            logger.error(`Error at Allocate Question Total Count : ${error.message}`);
            next(error);
        }
    },

    getCategoryName: async(req, res, next) => {
        try {
            let { cat_id, sub_id } = req.body;
            if (!cat_id || !sub_id) throw createError.BadRequest();

            const [category] = await db.sequelize.query(
                `select a.cat_name as maincategory, b.cat_name as subcategory from tbl__school_question_category as a 
                INNER JOIN tbl__school_question_category as b on b.pid = a.cat_id 
                where a.cat_id = ? and b.cat_id = ? and a.schoolid = ?`, {
                    replacements: [cat_id, sub_id, req.user.id],
                }

            );

            if (!category) {
                throw createError.NotFound("Question Not Found !!!");
            }
            res.send({ maincategory: category[0].maincategory, subcategory: category[0].subcategory });
        } catch (error) {
            logger.error(`Error at Get All Active Question : ${error.message}`);
            next(error);
        }
    },

    getQuestionById: async(req, res, next) => {
        try {
            let { qId } = req.params;
            if (qId == 0) throw createError.BadRequest();

            let question = await db.SchoolQuestions.findOne({
                where: {
                    qid: qId,
                    schoolid: req.user.id
                },
            });

            if (!question) throw createError.NotFound("Question Not Found !!!");
            res.send({ question });
        } catch (error) {
            logger.error(`Error at Get Question By Id : ${error.message}`);
            next(error);
        }
    },

}

function getSchoolQuestionNumber(cat_id, sub_id, schoolid) {
    return new Promise((resolve, reject) => {
        try {
            let count = 0;
            let catCode = "";
            db.sequelize.transaction(async(t) => {
                await db.SchoolQuestions.count({ where: { cat_id, sub_id, schoolid: schoolid } }, { transaction: t }).then((counts) => {
                    count = counts;
                });

                await db.SchoolQuestionCategory.findOne({
                    attributes: ["cat_code"],
                    where: {
                        cat_id: sub_id,
                        pid: cat_id,
                        schoolid: schoolid
                    },
                }, { transaction: t }).then((result) => {
                    catCode = result.cat_code;
                });
                let questionNo =
                    catCode + (count + 1).toString().padStart(4, "0");
                resolve(questionNo);
            });
        } catch (error) {
            reject(error);
        }
    });
}