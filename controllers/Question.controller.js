const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const logger = require("../helper/adminLogger");
const { ImageFilter } = require("../helper/general_helper");
const { sort } = require("locutus/php/array");
const { Op } = require("sequelize");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var homeCategoryDir = path.join(process.env.questions);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.questions);
    },
    filename: (req, file, callBack) => {
        if (
            req.q_type == "T" ||
            req.opt_type1 == "T" ||
            req.opt_type2 == "T" ||
            req.opt_type3 == "T" ||
            req.opt_type4 == "T" ||
            req.opt_type5 == "T"
        ) {
            return;
        } else {
            let usertype = req.user.type;
            let logintype = req.user.logintype;
            let userid = req.user.userid;
            callBack(
                null,
                `file-${logintype}-${usertype}-${userid}-${Date.now()}${path.extname(
                    file.originalname
                )}`
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
    getAllQuestion: async (req, res, next) => {
        try {
            let { status, cat_id, sub_id } = req.body;
            if (!status || !cat_id || !sub_id) throw createError.BadRequest();

            const { count, rows } = await db.Questions.findAndCountAll({
                attributes: [
                    "qid",
                    "q_type",
                    "question",
                    "question_code",
                    "quest_date",
                    "quest_level",
                    "quest_add_by",
                ],
                where: { quest_status: status, cat_id, sub_id },
                order: [
                    ["qid", "ASC"]
                ],
            });

            if (!rows) {
                throw createError.NotFound("Question Not Found !!!");
            }
            res.send({ count, questions: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Question : ${error.message}`);
            next(error);
        }
    },

    // 2. Get All Active Question
    getQuestionByCategories: async (req, res, next) => {
        try {
            let { sub_id } = req.params;
            if (sub_id == 0) throw createError.BadRequest();

            const { count, rows } = await db.Questions.findAndCountAll({
                where: { sub_id: sub_id },
            });

            if (!rows) {
                throw createError.NotFound("Question Not Found !!!");
            }
            res.send({ count, questions: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Question By Category : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Question By Id
    getQuestionById: async (req, res, next) => {
        try {
            let { qId } = req.params;
            if (qId == 0) throw createError.BadRequest();

            let question = await db.Questions.findOne({
                where: {
                    qid: qId,
                },
            });

            if (!question) throw createError.NotFound("Question Not Found !!!");
            res.send({ question });
        } catch (error) {
            logger.error(`Error at Get Question By Id : ${error.message}`);
            next(error);
        }
    },

    // 13. Get Passage Question
    getPassageQuestionById: async (req, res, next) => {
        try {
            let { qid } = req.params;
            if (qid == 0) throw createError.BadRequest();
            const [count, rows] = await db.sequelize.query(
                `SELECT * FROM tbl__question AS A INNER JOIN tbl__passage_question AS B ON A.qid = B.question_ref_id WHERE A.qid = ${qid} AND B.passage_quest_status != 'D' GROUP BY B.passage_question_id;`
            );
            if (!rows) throw createError.NotFound("Category Not Found !!!");
            res.send({ question: rows });
        } catch (error) {
            logger.error(`Error at Get Passage Questions By Id : ${error.message}`);
            next(error);
        }
    },

    // 3. Create Question
    createQuestion: async (req, res, next) => {
        try {
            let question_code;
            upload(req, res, async function (err) {
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

                let { questionNo } = await getQuestionNumber(
                    cat_id, sub_id
                ).catch((err) => {
                    console.log(err);
                });

                db.sequelize
                    .transaction(async (t) => {
                        // 1. tbl__exampackage insert
                        const questiondata = await db.Questions.create({
                            cat_id,
                            sub_id,
                            quest_add_type: req.user.type, //type,
                            q_type,
                            question: q_type == "I" ? req.files.question[0].filename : question,
                            question_code: questionNo,
                            quest_desc,
                            opt_type1,
                            opt_1: opt_type1 == "I" ? req.files.opt_1[0].filename : opt_1,
                            opt_type2,
                            opt_type3,
                            opt_type4,
                            opt_type5,
                            opt_2: opt_type2 == "I" ? req.files.opt_2[0].filename : opt_2,
                            opt_3: opt_type3 == "I" ? req.files.opt_3[0].filename : opt_3,
                            opt_4: opt_type4 == "I" ? req.files.opt_4[0].filename : opt_4,
                            opt_5: opt_type5 == "I" ? req.files.opt_5[0].filename : opt_5,
                            crt_ans,
                            quest_level,
                            quest_add_id: req.user.userid, //id,
                            quest_add_by: req.user.username, //name,
                            quest_pos,
                            quest_status: "W", //type == "A" ? "Y" : "W",
                            quest_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            aproved_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            quest_ipaddr,
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        });
                    })
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                res.send({ message: "Insert Success" });
            });
        } catch (error) {
            logger.error(`Error at Create Question : ${error.message}`);
            next(error);
        }
    },

    createPassageQuestions: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {

            upload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }

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
                    passage_questions
                } = req.body;
                console.log(req.body);
                console.log("passage", passage_questions);
                console.log(req.user);

                let { questionNo } = await getQuestionNumber(
                    cat_id, sub_id
                ).catch((err) => {
                    console.log(err);
                });

                db.sequelize
                    .transaction(async (t) => {
                        // 1. tbl__exampackage insert
                        const questiondata = await db.Questions.create({
                            cat_id,
                            sub_id,
                            quest_add_type: req.user.type, //type,
                            q_type,
                            question: question,
                            question_code: questionNo,
                            quest_desc,
                            opt_type1: "T",
                            opt_1: opt_1,
                            opt_type2: "T",
                            opt_type3: "T",
                            opt_type4: "T",
                            opt_type5: "T",
                            opt_2: opt_2,
                            opt_3: opt_3,
                            opt_4: opt_4,
                            opt_5: opt_5,
                            crt_ans,
                            quest_level,
                            quest_add_id: req.user.userid, //id,
                            quest_add_by: req.user.username, //name,
                            quest_pos,
                            quest_status: "W", //type == "A" ? "Y" : "W",
                            quest_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            aproved_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            quest_ipaddr,
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        });

                        console.log(questionNo);
                        console.log(passage_questions.length);

                        let passagequestionList = [];
                        for (let list of passage_questions) {
                            passagequestionList.push({
                                question_ref_id: questiondata.qid,
                                passage_q_type: 'T',
                                passage_question: list.question,
                                passage_quest_desc: list.quest_desc,
                                passage_opt_type1: 'T',
                                passage_opt_type2: 'T',
                                passage_opt_type3: 'T',
                                passage_opt_type4: 'T',
                                passage_opt_type5: 'T',
                                passage_opt_1: list.opt_1,
                                passage_opt_2: list.opt_2,
                                passage_opt_3: list.opt_3,
                                passage_opt_4: list.opt_4,
                                passage_opt_5: list.opt_5,
                                passage_crt_ans: list.crt_ans,
                                passage_quest_add_id: req.user.userid, //id,
                                passage_quest_add_by: req.user.username, //name,
                                passage_quest_pos: list.quest_pos,
                                passage_quest_status: "W", //type == "A" ? "Y" : "W",
                                passage_quest_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                passage_aproved_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                passage_quest_ipaddr: list.quest_ipaddr,
                                passage_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            });
                        };
                        console.log(passagequestionList);

                        // 3. tbl__exampackage_duration insert
                        await db.PassageQuestions.bulkCreate(passagequestionList, {
                            transaction: t,
                        });
                    })
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                res.send({ message: "Insert Success" });
            });
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Bank Exam : ${error.message}`);
            next(error);
        }
    },

    // 14. Update Passage Question
    updatePassageQuestions: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {

            const { qid } = req.params;
            upload(req, res, async function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }

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
                    passage_questions
                } = req.body;
                console.log(req.body);
                console.log("passage", passage_questions);
                console.log(req.user);

                let { questionNo } = await getQuestionNumber(
                    cat_id, sub_id
                ).catch((err) => {
                    console.log(err);
                });

                db.sequelize
                    .transaction(async (t) => {
                        // 1. tbl__exampackage insert
                        const questiondata = await db.Questions.update({
                            cat_id,
                            sub_id,
                            quest_add_type: req.user.type, //type,
                            q_type,
                            question: question,
                            question_code: questionNo,
                            quest_desc,
                            opt_type1: "T",
                            opt_1: opt_1,
                            opt_type2: "T",
                            opt_type3: "T",
                            opt_type4: "T",
                            opt_type5: "T",
                            opt_2: opt_2,
                            opt_3: opt_3,
                            opt_4: opt_4,
                            opt_5: opt_5,
                            crt_ans,
                            quest_level,
                            quest_add_id: req.user.userid, //id,
                            quest_add_by: req.user.username, //name,
                            quest_pos,
                            quest_status: "W", //type == "A" ? "Y" : "W",
                            quest_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            aproved_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            quest_ipaddr,
                            lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        }, { where: { qid: qid} });

                        console.log(questionNo);
                        console.log(passage_questions.length);

                        let passagequestionList = [];
                        for (let list of passage_questions) {
                            if (list.passage_question_id) {
                                passagequestionList.push({
                                    passage_question_id: list.passage_question_id,
                                    question_ref_id: qid,
                                    passage_q_type: 'T',
                                    passage_question: list.question,
                                    passage_quest_desc: list.quest_desc,
                                    passage_opt_type1: 'T',
                                    passage_opt_type2: 'T',
                                    passage_opt_type3: 'T',
                                    passage_opt_type4: 'T',
                                    passage_opt_type5: 'T',
                                    passage_opt_1: list.opt_1,
                                    passage_opt_2: list.opt_2,
                                    passage_opt_3: list.opt_3,
                                    passage_opt_4: list.opt_4,
                                    passage_opt_5: list.opt_5,
                                    passage_crt_ans: list.crt_ans,
                                    passage_quest_add_id: req.user.userid, //id,
                                    passage_quest_add_by: req.user.username, //name,
                                    passage_quest_pos: list.quest_pos,
                                    passage_quest_status: "W", //type == "A" ? "Y" : "W",
                                    passage_quest_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                    passage_aproved_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                    passage_quest_ipaddr: list.quest_ipaddr,
                                    passage_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                });
                            } else {
                                passagequestionList.push({
                                    question_ref_id: qid,
                                    passage_q_type: 'T',
                                    passage_question: list.question,
                                    passage_quest_desc: list.quest_desc,
                                    passage_opt_type1: 'T',
                                    passage_opt_type2: 'T',
                                    passage_opt_type3: 'T',
                                    passage_opt_type4: 'T',
                                    passage_opt_type5: 'T',
                                    passage_opt_1: list.opt_1,
                                    passage_opt_2: list.opt_2,
                                    passage_opt_3: list.opt_3,
                                    passage_opt_4: list.opt_4,
                                    passage_opt_5: list.opt_5,
                                    passage_crt_ans: list.crt_ans,
                                    passage_quest_add_id: req.user.userid, //id,
                                    passage_quest_add_by: req.user.username, //name,
                                    passage_quest_pos: list.quest_pos,
                                    passage_quest_status: "W", //type == "A" ? "Y" : "W",
                                    passage_quest_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                    passage_aproved_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                    passage_quest_ipaddr: list.quest_ipaddr,
                                    passage_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                });
                            }
                        };
                        console.log(passagequestionList);

                        // 3. tbl__exampackage_duration insert
                        await db.PassageQuestions.bulkCreate(passagequestionList, { updateOnDuplicate: [
                            "passage_q_type",
                            "passage_question",
                            "passage_quest_desc",
                            "passage_opt_type1",
                            "passage_opt_type2",
                            "passage_opt_type3",
                            "passage_opt_type4",
                            "passage_opt_type5",
                            "passage_opt_1",
                            "passage_opt_2",
                            "passage_opt_3",
                            "passage_opt_4",
                            "passage_opt_5",
                            "passage_crt_ans",
                            "passage_quest_add_id",
                            "passage_quest_add_by",
                            "passage_quest_pos",
                            "passage_quest_status",
                            "passage_quest_date",
                            "passage_aproved_date",
                            "passage_quest_ipaddr",
                            "passage_lastupdate"
                        ]}, {transaction: t});
                    })
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                res.send({ message: "Insert Success" });
            });
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Bank Exam : ${error.message}`);
            next(error);
        }
    },

    // 4. Update Question By Id
    updateQuestionById: async (req, res, next) => {
        try {
            upload(req, res, async function (err) {
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

                let questionvalue = await db.Questions.findOne({
                    where: {
                        qid: qId,
                    },
                });

                let questiondata;
                q_type == "I" ?
                    req.files.question ?
                        (questiondata = req.files.question[0].filename) :
                        (questiondata = questionvalue.question) :
                    (questiondata = question);

                let opt1data;
                opt_type1 == "I" ?
                    req.files.opt_1 ?
                        (opt1data = req.files.opt_1[0].filename) :
                        (opt1data = questionvalue.opt_1) :
                    (opt1data = opt_1);

                let opt2data;
                opt_type2 == "I" ?
                    req.files.opt_2 ?
                        (opt2data = req.files.opt_2[0].filename) :
                        (opt2data = questionvalue.opt_2) :
                    (opt2data = opt_2);

                let opt3data;
                opt_type3 == "I" ?
                    req.files.opt_3 ?
                        (opt3data = req.files.opt_3[0].filename) :
                        (opt3data = questionvalue.opt_3) :
                    (opt3data = opt_3);

                let opt4data;
                opt_type4 == "I" ?
                    req.files.opt_4 ?
                        (opt4data = req.files.opt_4[0].filename) :
                        (opt4data = questionvalue.opt_4) :
                    (opt4data = opt_4);

                let opt5data;
                opt_type5 == "I" ?
                    req.files.opt_5 ?
                        (opt5data = req.files.opt_5[0].filename) :
                        (opt5data = questionvalue.opt_5) :
                    (opt5data = opt_5);

                db.Questions.update({
                    cat_id,
                    sub_id,
                    q_type,
                    question: questiondata,
                    question_code,
                    quest_desc,
                    opt_type1,
                    opt_1: opt1data,
                    opt_type2,
                    opt_type3,
                    opt_type4,
                    opt_type5,
                    opt_2: opt2data,
                    opt_3: opt3data,
                    opt_4: opt4data,
                    opt_5: opt5data,
                    crt_ans,
                    quest_level,
                    quest_pos,
                    quest_ipaddr,
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                }, { where: { qid: qId } })
                    .then((message) => res.send({ message: "Update Success !!!" }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            });
        } catch (error) {
            logger.error(`Error at Update Question : ${error.message}`);
            next(error);
        }
    },

    // 15. Delete Passage Question
    deletePassageQuestions: async (req, res, next) => {
        try {
            const { qid } = req.params;
            await db.PassageQuestions.update({
                passage_quest_status: "D",
            }, { where: { passage_question_id: qid} });
            res.send({ message: "Delete Success" });
        } catch (error) {
            logger.error(`Error at Delete Question : ${error.message}`);
            next(error);
        }
    },

    // 5. Question Number
    getQuestionNo: async (req, res, next) => {
        try {
            const { cat_id, sub_id } = req.body;
            if (!cat_id || !sub_id) throw createError.BadRequest();

            let count = 0;
            let catCode = "";

            await db.sequelize.transaction(async (t) => {
                await db.Questions.count({ where: { cat_id, sub_id } }, { transaction: t }).then(
                    (counts) => {
                        count = counts;
                    }
                );

                await db.Category.findOne({
                    attributes: ["cat_code"],
                    where: {
                        cat_id: sub_id,
                        pid: cat_id,
                    },
                }, { transaction: t }).then((result) => {
                    catCode = result.cat_code;
                });
            });
            //console.log(catCode + (count + 1).toString().padStart(4, "0"));
            res.send({
                questionNo: catCode + (count + 1).toString().padStart(3, "0"),
            });
        } catch (error) {
            logger.error(`Error at Get Question No : ${error.message}`);
            next(error);
        }
    },

    getAllocateQuestion: async (req, res, next) => {
        try {
            let { pagecount, exam_id, exam_master_id, exam_cat_id } = req.body;
            if (!pagecount || !exam_id || !exam_master_id || !exam_cat_id)
                throw createError.BadRequest();

            let Exam = await db.Exams.findOne({
                where: { exam_id: exam_id },
            });
            let offset = (pagecount - 1) * 1000;
            const [question] = await db.sequelize.query(
                ` select a.qid,a.q_type,a.question,a.quest_add_by,a.quest_date,a.quest_level,
           a.quest_status,a.question_code
              ,b.cat_name as 'Category',c.cat_name as 'Subcategory' from tbl__question as a
		    inner join tbl__category as b on a.cat_id= b.cat_id
                inner join tbl__category as c on a.sub_id= c.cat_id 
                where a.quest_level in(` +
                Exam.exam_level +
                `) and a.quest_status='Y' and a.qid not in
                (select qid from tbl__examquestions where exam_id=? and exam_cat=?
                and exam_subcat=? and exam_queststatus='Y') order by a.qid desc
		limit 1000 OFFSET ${offset}`, {
                replacements: [exam_id, exam_master_id, exam_cat_id],
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
                    ` select qid from tbl__examquestions where exam_id!=? 
                    and exam_queststatus='Y' and exam_cat=?
                    and exam_subcat=? 
                    and qid in (` +
                    questiondata +
                    `)
                    group by qid
                    `, {
                    replacements: [exam_id, exam_master_id, exam_cat_id],
                }
                );
                res.send({ count: question.length, question, examquestion });
            } else {
                let examquestion = [];
                res.send({ count: question.length, question, examquestion });
            }
        } catch (error) {
            logger.error(`Error at Allocate Question : ${error.message}`);
            next(error);
        }
    },
    getAllocateQuestionTotalCount: async (req, res, next) => {
        try {
            let { exam_id, exam_master_id, exam_cat_id } = req.body;
            if (!exam_id || !exam_master_id || !exam_cat_id) throw createError.BadRequest();

            let Exam = await db.Exams.findOne({
                where: { exam_id: exam_id },
            });
            const [question] = await db.sequelize.query(
                ` select count(a.qid) as totalcount from tbl__question as a
                where a.quest_level in(` +
                Exam.exam_level +
                `) and a.quest_status='Y' and a.qid not in
                (select qid from tbl__examquestions where exam_id=? and exam_cat=?
                and exam_subcat=? and exam_queststatus='Y')
                `, {
                replacements: [exam_id, exam_master_id, exam_cat_id],
            }
            );
            res.send({ totalcount: question[0].totalcount });
        } catch (error) {
            logger.error(`Error at Allocate Question Total Count : ${error.message}`);
            next(error);
        }
    },
    // 6. Update 'Active / Inactive / Delete'
    updateStatusById: async (req, res, next) => {
        try {
            let { qid, status } = req.body;
            if (!qid || !status) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    if (status == "Y") {
                        await db.Questions.update({
                            quest_status: status,
                            aproved_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        }, { where: { qid: qid } }, { transaction: t });
                    } else {
                        await db.Questions.update({ quest_status: status }, { where: { qid: qid } }, { transaction: t });
                    }
                })
                .then((result) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Question By Id : ${error.message}`);
            next(error);
        }
    },

    // 11. Question Search Result
    getSearchResult: async (req, res, next) => {
        try {
            let { qType, difficulty, faculty, searchString, sortBy, cat_id, sub_id, datatype } = req.body;
            if (
                qType == null ||
                difficulty == null ||
                faculty == null ||
                searchString == null ||
                sortBy == null ||
                cat_id == null ||
                sub_id == null ||
                datatype == null
            )
                throw createError.BadRequest();
            sortBy == "" ? (sortBy = "ASC") : sortBy;
            if (!!searchString) searchString = `%${searchString}%`;

            /*if (qType != "" && difficulty == "" && faculty == "" && searchString == "") {
                conditions = `q_type = '${qType}' AND`;
            } else if (qType != "" && difficulty != "" && faculty == "" && searchString == "") {
                conditions = `q_type = '${qType}' AND  quest_level = '${difficulty}' AND`;
            } else if (qType != "" && difficulty != "" && faculty != "" && searchString == "") {
                conditions = `q_type = '${qType}' AND  quest_level = '${difficulty}' AND quest_add_id = '${faculty}' AND`;
            } else if (qType != "" && difficulty != "" && faculty != "" && searchString != "") {
                conditions = `q_type = '${qType}' AND  quest_level = '${difficulty}' AND quest_add_id = '${faculty}' AND question LIKE '${searchString}' AND`;
            } else if (qType == "" && difficulty != "" && faculty == "" && searchString == "") {
                conditions = `quest_level = '${difficulty}' AND`;
            } else if (qType == "" && difficulty == "" && faculty != "" && searchString == "") {
                conditions = `quest_add_id = '${faculty}' AND`;
            } else if (qType == "" && difficulty == "" && faculty == "" && searchString != "") {
                conditions = `question LIKE '${searchString}' AND`;
            } else {
                conditions = ``;
            }*/

            let conditions = ``;

            if (qType != "") {
                conditions = `q_type = '${qType}' AND `;
            }
            if (faculty != "") {
                conditions = conditions + `quest_add_id = ${faculty} AND `;
            }
            if (searchString != "") {
                conditions = conditions + `question LIKE '${searchString}' OR question_code LIKE '${searchString}' AND `;
            }
            if (difficulty != "") {
                conditions = conditions + `quest_level = ${difficulty} AND `;
            }

            const [questions] = await db.sequelize.query(
                `SELECT qid,q_type,question,question_code,
                quest_desc,quest_date,opt_1,opt_2,opt_3,opt_4,opt_5,
                opt_type1,opt_type2,opt_type3,opt_type4,opt_type5,
                crt_ans,quest_level,quest_add_by 
                FROM tbl__question WHERE ${conditions} quest_status = '${datatype}' AND cat_id = ${cat_id} AND sub_id = ${sub_id} ORDER BY quest_date ${sortBy};`,

            );
            if (!questions) res.send({ count, questions: "Not Found !!!" });
            res.send({ count: questions.length, questions });

            /*
            const { count, rows } = await db.Questions.findAndCountAll({
                where: {
                    [Op.or]: [
                        { quest_level: difficulty },
                        { quest_add_id: faculty },
                        { q_type: qType },
                        {
                            question: {
                                [Op.like]: searchString,
                            },
                        },
                    ],
                    quest_status: { [Op.ne]: "D" },
                    cat_id,
                    sub_id,
                },
                order: [["quest_date", sortBy == "" ? "ASC" : sortBy]],
            });
            if (count == 0) res.send({ count, questions: "Not Found !!!" });
            res.send({ count, questions: rows });
            */
        } catch (error) {
            logger.error(`Error at Question Search Result : ${error.message}`);
            next(error);
        }
    },

    // 7. Get Dashboard Count
    getQuestionsCount: async (req, res, next) => {
        try {
            const count = await db.Questions.count({
                where: {
                    quest_status: {
                        [Op.ne]: 'D'
                    }
                }
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get Dashboard Count : ${error.message}`);
            next(error);
        }
    },

    // 10. Get Questions Count Only
    getQuestionsCountOnly: async (req, res, next) => {
        try {
            let { quest_status, sub_id, cat_id } = req.body;
            if (!quest_status || !sub_id || !cat_id) throw createError.BadRequest();
            let count = 0;
            // quest_add_id: req.user.id,
            // Add this to where quest_add_id
            count = await db.Questions.count({ where: { quest_status, sub_id, cat_id } }).catch(
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


    getCategoryName: async (req, res, next) => {
        try {
            let { cat_id, sub_id } = req.body;
            if (!cat_id || !sub_id) throw createError.BadRequest();

            const [category] = await db.sequelize.query(
                `select a.cat_name as maincategory, b.cat_name as subcategory from tbl__category as a 
                INNER JOIN tbl__category as b on b.pid = a.cat_id 
                where a.cat_id = ? and b.cat_id = ?`, {
                replacements: [cat_id, sub_id],
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
    }
};

function getQuestionNumber(cat_id, sub_id) {
    return new Promise((resolve, reject) => {
        try {
            let count = 0;
            let catCode = "";
            db.sequelize.transaction(async (t) => {
                await db.Questions.count({ where: { cat_id, sub_id } }, { transaction: t }).then(
                    (counts) => {
                        count = counts;
                    }
                );

                await db.Category.findOne({
                    attributes: ["cat_code"],
                    where: {
                        cat_id: sub_id,
                        pid: cat_id,
                    },
                }, { transaction: t }).then((result) => {
                    catCode = result.cat_code;
                });
                let questionNo = catCode + (count + 1).toString().padStart(3, "0");
                resolve({ questionNo });
            });
        } catch (error) {
            reject(error);
        }
    });
}