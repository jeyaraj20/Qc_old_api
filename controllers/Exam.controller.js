const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const { Op } = require("sequelize");
const logger = require("../helper/adminLogger");
const _ = require("underscore");

var pdf = require('html-pdf');
const { decode } = require('html-entities');
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');

const examQuestionTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/examQuestion.html'), 'utf8');
const template = handlebars.compile(examQuestionTemplate);

const examQuestionSecTemplate = fs.readFileSync(path.resolve(__dirname, '../templates/examSecQuestion.html'), 'utf8');
const secTemplate = handlebars.compile(examQuestionSecTemplate);

const templatesPath = path.resolve(__dirname, "..", "templates");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    // 1. Get All Exam By Status
    getAllExam: async (req, res, next) => {
        try {
            let { type, status, exa_cat_id } = req.body;
            if (!type || !status || !exa_cat_id) throw createError.BadRequest();

            const { count, rows } = await db.Exams.findAndCountAll({
                where: {
                    exam_type: type,
                    exam_status: status,
                    exam_sub_sub: exa_cat_id,
                },
                order: [["exam_id"]],
            });

            if (!rows) {
                throw createError.NotFound("Exam Not Found !!!");
            }
            res.send({ count, Exam: rows });
        } catch (error) {
            logger.error(`Error at Get All Exam By Status : ${error.message}`);
            next(error);
        }
    },

    getAllExamWithAssignedcount: async (req, res, next) => {
        try {
            let { type, status, exa_cat_id } = req.body;
            if (!type || !status || !exa_cat_id) throw createError.BadRequest();
            /*
            const { count, rows } = await db.Exams.findAndCountAll({
                where: {
                    exam_type: type,
                    exam_status: status,
                    exam_sub_sub: exa_cat_id,
                },
                order: [["exam_id"]],
            });
            */

            const [Exam] = await db.sequelize.query(`
           SELECT a.*,
           COUNT(b.exam_id) as totalassigned FROM tbl__exam AS a 
           left join tbl__examquestions as b on a.exam_id=b.exam_id and b.exam_queststatus='Y'
           WHERE a.exam_type = '${type}' AND a.exam_status = '${status}' 
            AND a.exam_sub_sub = ${exa_cat_id} 
            group by a.exam_id
            ORDER BY a.exam_id;`
            );
            if (!Exam) {
                throw createError.NotFound("Exam Not Found !!!");
            }
            res.send({ count: Exam.length, Exam: Exam });
        } catch (error) {
            logger.error(`Error at Get All Exam By Status : ${error.message}`);
            next(error);
        }
    },

    getAllExamCount: async (req, res, next) => {
        try {
            let { type, status, exa_cat_id } = req.body;
            if (!type || !status || !exa_cat_id) throw createError.BadRequest();

            count = await db.Exams.count({
                where: { exam_type: type, exam_status: status, exam_sub_sub: exa_cat_id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
            if (!rows) {
                throw createError.NotFound("Exam Not Found !!!");
            }
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get All Exam By Status : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Exam By Id
    getExamById: async (req, res, next) => {
        try {
            let { id } = req.params;
            if (id == 0) throw createError.BadRequest();

            let Exam = await db.Exams.findOne({
                include: [
                    {
                        model: db.ExamSectionDetails,
                    },
                ],
                where: { exam_id: id },
            });

            if (!Exam) throw createError.NotFound("Exam Not Found !!!");
            res.send({ Exam });
        } catch (error) {
            logger.error(`Error at Get Exam By Id : ${error.message}`);
            next(error);
        }
    },

    // 3. Create Common Exam
    createExam: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const {
                exam_cat,
                exam_sub,
                exam_sub_sub,
                exam_name,
                exam_slug,
                assign_test_type,
                exam_type,
                exam_code,
                exam_level,
                sect_cutoff,
                sect_timing,
                tot_questions,
                tot_mark,
                mark_perquest,
                neg_markquest,
                total_time,
                quest_type,
                exam_type_cat,
                exam_type_id,
                exam_pos,
                payment_flag,
                selling_price,
                offer_price,
                ip_addr,
                automatic,
                startDate,
                endDate
            } = req.body;
            if (
                !exam_cat ||
                !exam_sub ||
                !exam_sub_sub ||
                !exam_name ||
                !exam_slug ||
                !assign_test_type ||
                !exam_type ||
                !exam_code ||
                !exam_level ||
                !sect_cutoff ||
                !sect_timing ||
                !tot_questions ||
                !tot_mark ||
                !mark_perquest ||
                !neg_markquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !exam_pos ||
                !ip_addr
            )
                throw createError.BadRequest();

            const [exam, created] = await db.Exams.findOrCreate({
                where: { exam_code, exam_status: { [Op.ne]: "D" } },
                defaults: {
                    exam_cat,
                    exam_sub,
                    exam_sub_sub,
                    exam_name,
                    exam_slug,
                    assign_test_type,
                    exam_type,
                    exam_code,
                    exam_level,
                    sect_cutoff,
                    sect_timing,
                    tot_questions,
                    tot_mark,
                    mark_perquest,
                    neg_markquest,
                    total_time,
                    quest_type,
                    exam_type_cat,
                    exam_type_id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD"),
                    payment_flag,
                    selling_price,
                    offer_price,
                    ip_addr,
                    last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    transaction: t,
                    startDate: startDate,
                    endDate: endDate
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            /*res.send({ message: "Exam Created Success !!!" });
            await t.commit();*/
            if (created) {
                if (exam.quest_type == 'AUTO') {
                    let automaticList = [];
                    automatic.forEach((list) => {
                        automaticList.push({
                            examid: exam.exam_id,
                            catid: list.maincategoryId,
                            subcatid: list.subcategoryId,
                            sectid: 0,
                            noofquestions: list.noofquest,
                            questionlevel: exam.exam_level,
                            activestatus: 'Y',
                            createdby: req.user.id,
                            createdtimestamp: moment(Date.now()).format("YYYY-MM-DD")
                        });
                    });
                    // 2. tbl__automatic_question_details insert
                    let automaticdata = await db.AutomaticQuestionDetails.bulkCreate(automaticList, {
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    let examquestionslist = [];
                    let check = 0;
                    for (const automatic of automaticdata) {
                        const [questionsdata] = await db.sequelize.query(`SELECT * from tbl__question WHERE cat_id = ${automatic.catid} 
                        and sub_id = ${automatic.subcatid} and quest_status = 'Y' and quest_level in (${automatic.questionlevel}) and qid
                        not in (SELECT qid from tbl__examquestions 
                            WHERE exam_id = ${automatic.examid} and sect_id = 0 and exam_queststatus = 'Y' ) 
                            ORDER BY RAND() LIMIT ${automatic.noofquestions}`,
                            { transaction: t }
                        );
                        console.log(questionsdata);
                        console.log(questionsdata.length);
                        console.log(automatic.noofquestions);
                        if (questionsdata.length != automatic.noofquestions) {
                            check = 1;
                        }
                        console.log(check);
                        if (check == 0) {
                            questionsdata.forEach((question) => {
                                examquestionslist.push({
                                    exam_id: automatic.examid,
                                    exam_cat: exam.exam_cat,
                                    exam_subcat: exam.exam_sub,
                                    sect_id: automatic.sectid,
                                    exam_name: exam.exam_name,
                                    exam_code: exam.exam_code,
                                    quest_type: exam.quest_type,
                                    quest_assigned_type: req.user.logintype,
                                    quest_assigned_id: req.user.id,
                                    quest_assigned_name: req.user.username,
                                    qid: question.qid,
                                    cat_id: question.cat_id,
                                    sub_id: question.sub_id,
                                    q_type: question.q_type,
                                    question: question.question,
                                    quest_desc: question.quest_desc,
                                    opt_type1: question.opt_type1,
                                    opt_type2: question.opt_type2,
                                    opt_type3: question.opt_type3,
                                    opt_type4: question.opt_type4,
                                    opt_type5: question.opt_type5,
                                    opt_1: question.opt_1,
                                    opt_2: question.opt_2,
                                    opt_3: question.opt_3,
                                    opt_4: question.opt_4,
                                    opt_5: question.opt_5,
                                    crt_ans: question.crt_ans,
                                    quest_level: question.quest_level,
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
                            })
                            console.log(examquestionslist);
                        }
                    }
                    console.log('test');
                    //if (examquestionslist.length > 0) {
                    await db.ExamQuestions.bulkCreate(examquestionslist, {
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                }
                res.send({ message: "Common Exam Created Success !!!" });
            } else {
                throw createError.Conflict(`${exam_code} - Exam Code Already Exists`);
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            res.send({ message: "Exam Code already exists" });
            logger.error(`Error at Create Common Exam : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Bank Exam
    createBankExam: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const {
                exam_cat,
                exam_sub,
                exam_sub_sub,
                exam_name,
                exam_slug,
                assign_test_type,
                exam_type,
                exam_code,
                exam_level,
                sect_cutoff,
                sect_timing,
                tot_questions,
                tot_mark,
                mark_perquest,
                neg_markquest,
                total_time,
                quest_type,
                exam_type_cat,
                exam_type_id,
                exam_pos,
                payment_flag,
                selling_price,
                offer_price,
                ip_addr,
                sections,
                startDate,
                endDate
            } = req.body;
            if (
                !exam_cat ||
                !exam_sub ||
                !exam_sub_sub ||
                !exam_name ||
                !exam_slug ||
                !assign_test_type ||
                !exam_type ||
                !exam_code ||
                !exam_level ||
                !sect_cutoff ||
                !sect_timing ||
                !tot_questions ||
                !tot_mark ||
                !mark_perquest ||
                !neg_markquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !exam_pos ||
                !ip_addr ||
                !sections
            )
                throw createError.BadRequest();

            const [exam, created] = await db.Exams.findOrCreate({
                where: { exam_code, exam_status: { [Op.ne]: "D" } },
                defaults: {
                    exam_cat,
                    exam_sub,
                    exam_sub_sub,
                    exam_name,
                    exam_slug,
                    assign_test_type,
                    exam_type,
                    exam_code,
                    exam_level,
                    sect_cutoff,
                    sect_timing,
                    tot_questions,
                    tot_mark,
                    mark_perquest,
                    neg_markquest,
                    total_time,
                    quest_type,
                    exam_type_cat,
                    exam_type_id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD"),
                    ip_addr,
                    payment_flag,
                    selling_price,
                    offer_price,
                    last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    transaction: t,
                    startDate,
                    endDate
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (created) {
                let examSectionsList = [];
                d_ques_ans = 0;
                sections.forEach((list) => {
                    examSectionsList.push({
                        exam_id: exam.exam_id,
                        main_cat: exam.exam_sub,
                        sub_cat: exam.exam_sub_sub,
                        menu_title: list.menu_title,
                        no_ofquest: list.no_ofquest,
                        mark_perquest: list.mark_perquest,
                        tot_marks: list.tot_marks,
                        neg_mark: list.neg_mark,
                        ques_ans: d_ques_ans,
                        cut_off: list.cut_off,
                        sect_time: list.sect_time,
                        sect_date: moment(Date.now()).format("YYYY-MM-DD"),
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    });
                });
                // 2. tbl__exam_sectdetails insert
                let bulkdata = await db.ExamSectionDetails.bulkCreate(examSectionsList, {
                    transaction: t,
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                if (quest_type == 'AUTO') {
                    let automaticlist = [];
                    let increment = 0;
                    if (bulkdata) {
                        bulkdata.forEach((data) => {
                            let questionbank = sections[increment].questionbank;
                            for (let i = 0; i < questionbank.length; i++) {
                                automaticlist.push({
                                    examid: exam.exam_id,
                                    sectid: data.sect_id,
                                    catid: questionbank[i].maincategoryId,
                                    subcatid: questionbank[i].subcategoryId,
                                    noofquestions: questionbank[i].noofquest,
                                    questionlevel: exam.exam_level,
                                    activestatus: 'Y',
                                    createdby: req.user.id,
                                    createdtimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                })
                            }
                            increment = increment + 1;
                        });
                        let automaticdata = await db.AutomaticQuestionDetails.bulkCreate(automaticlist, {
                            transaction: t,
                        }).catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                        let examquestionslist = [];
                        let check = 0;
                        for (const automatic of automaticdata) {
                            const [questionsdata] = await db.sequelize.query(`SELECT * from tbl__question WHERE cat_id = ${automatic.catid} 
                        and sub_id = ${automatic.subcatid} and quest_status = 'Y' and quest_level in (${automatic.questionlevel}) and qid
                        not in (SELECT qid from tbl__examquestions 
                            WHERE exam_id = ${automatic.examid} and sect_id = ${automatic.sectid} and exam_queststatus = 'Y' ) 
                            ORDER BY RAND() LIMIT ${automatic.noofquestions}`,
                                { transaction: t }
                            );
                            console.log(questionsdata);
                            console.log(questionsdata.length);
                            console.log(automatic.noofquestions);
                            if (questionsdata.length != automatic.noofquestions) {
                                check = 1;
                            }
                            console.log(check);
                            if (check == 0) {
                                questionsdata.forEach((question) => {
                                    examquestionslist.push({
                                        exam_id: automatic.examid,
                                        exam_cat: exam.exam_cat,
                                        exam_subcat: exam.exam_sub,
                                        sect_id: automatic.sectid,
                                        exam_name: exam.exam_name,
                                        exam_code: exam.exam_code,
                                        quest_type: exam.quest_type,
                                        quest_assigned_type: req.user.logintype,
                                        quest_assigned_id: req.user.id,
                                        quest_assigned_name: req.user.username,
                                        qid: question.qid,
                                        cat_id: question.cat_id,
                                        sub_id: question.sub_id,
                                        q_type: question.q_type,
                                        question: question.question,
                                        quest_desc: question.quest_desc,
                                        opt_type1: question.opt_type1,
                                        opt_type2: question.opt_type2,
                                        opt_type3: question.opt_type3,
                                        opt_type4: question.opt_type4,
                                        opt_type5: question.opt_type5,
                                        opt_1: question.opt_1,
                                        opt_2: question.opt_2,
                                        opt_3: question.opt_3,
                                        opt_4: question.opt_4,
                                        opt_5: question.opt_5,
                                        crt_ans: question.crt_ans,
                                        quest_level: question.quest_level,
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
                                })
                                console.log(examquestionslist);
                            }
                        }
                        await db.ExamQuestions.bulkCreate(examquestionslist, {
                            transaction: t,
                        }).catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                    }
                }
                res.send({ message: "Bank Exam Created Success !!!" });
            } else {
                throw createError.Conflict(`${exam_code} - Exam Code Already Exists`);
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Bank Exam : ${error.message}`);
            next(error);
        }
    },

    createSectionalExam: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        var d_exam_type = "D";
        try {
            const {
                exam_cat,
                exam_sub,
                exam_sub_sub,
                exam_name,
                exam_slug,
                assign_test_type,
                exam_type,
                exam_code,
                exam_level,
                sect_cutoff,
                sect_timing,
                tot_questions,
                tot_mark,
                mark_perquest,
                neg_markquest,
                total_time,
                quest_type,
                exam_type_cat,
                exam_type_id,
                exam_pos,
                payment_flag,
                selling_price,
                offer_price,
                ip_addr,
                sections,
                startDate,
                endDate
            } = req.body;
            if (
                !exam_cat ||
                !exam_sub ||
                !exam_sub_sub ||
                !exam_name ||
                !exam_slug ||
                !assign_test_type ||
                !exam_type ||
                !exam_code ||
                !exam_level ||
                !sect_cutoff ||
                !sect_timing ||
                !tot_questions ||
                !tot_mark ||
                !mark_perquest ||
                !neg_markquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !exam_pos ||
                !ip_addr ||
                !sections
            )
                throw createError.BadRequest();

            const [exam, created] = await db.Exams.findOrCreate({
                where: { exam_code, exam_status: { [Op.ne]: "D" } },
                defaults: {
                    exam_cat,
                    exam_sub,
                    exam_sub_sub,
                    exam_name,
                    exam_slug,
                    assign_test_type,
                    exam_type: d_exam_type,
                    exam_code,
                    exam_level,
                    sect_cutoff,
                    sect_timing,
                    tot_questions,
                    tot_mark,
                    mark_perquest,
                    neg_markquest,
                    total_time,
                    quest_type,
                    exam_type_cat,
                    exam_type_id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD"),
                    ip_addr,
                    payment_flag,
                    selling_price,
                    offer_price,
                    last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    transaction: t,
                    startDate,
                    endDate
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (created) {
                let examSectionsList = [];
                sections.forEach((list) => {
                    examSectionsList.push({
                        exam_id: exam.exam_id,
                        main_cat: exam.exam_sub,
                        sub_cat: exam.exam_sub_sub,
                        menu_title: list.menu_title,
                        ques_ans: list.ques_ans,
                        no_ofquest: list.no_ofquest,
                        mark_perquest: list.mark_perquest,
                        tot_marks: list.tot_marks,
                        neg_mark: list.neg_mark,
                        cut_off: list.cut_off,
                        sect_time: list.sect_time,
                        sect_date: moment(Date.now()).format("YYYY-MM-DD"),
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    });
                });
                // 2. tbl__exam_sectdetails insert
                let bulkdata = await db.ExamSectionDetails.bulkCreate(examSectionsList, {
                    transaction: t,
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                if (quest_type == 'AUTO') {
                    let automaticlist = [];
                    let increment = 0;
                    if (bulkdata) {
                        bulkdata.forEach((data) => {
                            let questionbank = sections[increment].questionbank;
                            for (let i = 0; i < questionbank.length; i++) {
                                automaticlist.push({
                                    examid: exam.exam_id,
                                    sectid: data.sect_id,
                                    catid: questionbank[i].maincategoryId,
                                    subcatid: questionbank[i].subcategoryId,
                                    noofquestions: questionbank[i].noofquest,
                                    questionlevel: exam.exam_level,
                                    activestatus: 'Y',
                                    createdby: req.user.id,
                                    createdtimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                                })
                            }
                            increment = increment + 1;
                        });
                        let automaticdata = await db.AutomaticQuestionDetails.bulkCreate(automaticlist, {
                            transaction: t,
                        }).catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                        let examquestionslist = [];
                        let check = 0;
                        for (const automatic of automaticdata) {
                            const [questionsdata] = await db.sequelize.query(`SELECT * from tbl__question WHERE cat_id = ${automatic.catid} 
                        and sub_id = ${automatic.subcatid} and quest_status = 'Y' and quest_level in (${automatic.questionlevel}) and qid
                        not in (SELECT qid from tbl__examquestions 
                            WHERE exam_id = ${automatic.examid} and sect_id = ${automatic.sectid} and exam_queststatus = 'Y' ) 
                            ORDER BY RAND() LIMIT ${automatic.noofquestions}`,
                                { transaction: t }
                            );
                            if (questionsdata.length != automatic.noofquestions) {
                                check = 1;
                            }
                            console.log(check);
                            if (check == 0) {
                                questionsdata.forEach((question) => {
                                    examquestionslist.push({
                                        exam_id: automatic.examid,
                                        exam_cat: exam.exam_cat,
                                        exam_subcat: exam.exam_sub,
                                        sect_id: automatic.sectid,
                                        exam_name: exam.exam_name,
                                        exam_code: exam.exam_code,
                                        quest_type: exam.quest_type,
                                        quest_assigned_type: req.user.logintype,
                                        quest_assigned_id: req.user.id,
                                        quest_assigned_name: req.user.username,
                                        qid: question.qid,
                                        cat_id: question.cat_id,
                                        sub_id: question.sub_id,
                                        q_type: question.q_type,
                                        question: question.question,
                                        quest_desc: question.quest_desc,
                                        opt_type1: question.opt_type1,
                                        opt_type2: question.opt_type2,
                                        opt_type3: question.opt_type3,
                                        opt_type4: question.opt_type4,
                                        opt_type5: question.opt_type5,
                                        opt_1: question.opt_1,
                                        opt_2: question.opt_2,
                                        opt_3: question.opt_3,
                                        opt_4: question.opt_4,
                                        opt_5: question.opt_5,
                                        crt_ans: question.crt_ans,
                                        quest_level: question.quest_level,
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
                                })
                                console.log(examquestionslist);
                            }
                        }
                        await db.ExamQuestions.bulkCreate(examquestionslist, {
                            transaction: t,
                        }).catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                    }
                }
                res.send({ message: "Sectional Exam Created Success !!!" });
            } else {
                throw createError.Conflict(`${exam_code} - Exam Code Already Exists`);
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Bank Exam : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Exam
    updateExamById: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                exam_cat,
                exam_sub,
                exam_sub_sub,
                exam_name,
                exam_slug,
                assign_test_type,
                exam_type,
                exam_code,
                exam_level,
                sect_cutoff,
                sect_timing,
                tot_questions,
                tot_mark,
                mark_perquest,
                neg_markquest,
                total_time,
                quest_type,
                exam_type_cat,
                exam_type_id,
                exam_pos,
                payment_flag,
                selling_price,
                offer_price,
                ip_addr,
                startDate,
                endDate
            } = req.body;
            if (
                !exam_cat ||
                !exam_sub ||
                !exam_sub_sub ||
                !exam_name ||
                !exam_slug ||
                !assign_test_type ||
                !exam_type ||
                !exam_code ||
                !exam_level ||
                !sect_cutoff ||
                !sect_timing ||
                !tot_questions ||
                !tot_mark ||
                !mark_perquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !ip_addr
            )
                throw createError.BadRequest();

            await db.Exams.update(
                {
                    exam_cat,
                    exam_sub,
                    exam_sub_sub,
                    exam_name,
                    exam_slug,
                    assign_test_type,
                    exam_type,
                    exam_code,
                    exam_level,
                    sect_cutoff,
                    sect_timing,
                    tot_questions,
                    tot_mark,
                    mark_perquest,
                    neg_markquest,
                    total_time,
                    quest_type,
                    exam_type_cat,
                    exam_type_id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD"),
                    payment_flag,
                    selling_price,
                    offer_price,
                    ip_addr,
                    startDate,
                    endDate,
                    last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
                { where: { exam_id: id } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ message: "Exam Updated Success !!!" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Update Common Exam : ${error.message}`);
            next(error);
        }
    },

    // 6. Update Bank Exam
    updateBankExamById: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { id } = req.params;
            console.log('edit');
            const {
                exam_cat,
                exam_sub,
                exam_sub_sub,
                exam_name,
                exam_slug,
                assign_test_type,
                exam_type,
                exam_code,
                exam_level,
                sect_cutoff,
                sect_timing,
                tot_questions,
                tot_mark,
                mark_perquest,
                neg_markquest,
                total_time,
                quest_type,
                exam_type_cat,
                exam_type_id,
                exam_pos,
                payment_flag,
                selling_price,
                offer_price,
                ip_addr,
                sections,
                startDate,
                endDate
            } = req.body;
            if (
                !exam_cat ||
                !exam_sub ||
                !exam_sub_sub ||
                !exam_name ||
                !exam_slug ||
                !assign_test_type ||
                !exam_type ||
                !exam_code ||
                !exam_level ||
                !sect_cutoff ||
                !sect_timing ||
                !tot_questions ||
                !tot_mark ||
                !mark_perquest ||
                !neg_markquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !ip_addr ||
                !sections
            )
                throw createError.BadRequest();

            await db.Exams.update(
                {
                    exam_cat,
                    exam_sub,
                    exam_sub_sub,
                    exam_name,
                    exam_slug,
                    assign_test_type,
                    exam_type,
                    exam_code,
                    exam_level,
                    sect_cutoff,
                    sect_timing,
                    tot_questions,
                    tot_mark,
                    mark_perquest,
                    neg_markquest,
                    total_time,
                    quest_type,
                    exam_type_cat,
                    exam_type_id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    payment_flag,
                    selling_price,
                    offer_price,
                    ip_addr,
                    startDate,
                    endDate,
                    last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
                { where: { exam_id: id } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            let exam = await db.Exams.findOne({
                where: { exam_id: id },
            });

            let examSectionsList = [];
            var d_ques_ans = 0;
            let old_sections = sections.filter(s => s.sect_id);
            let new_sections = sections.filter(s => !s.sect_id);
            new_sections.forEach((list) => {
                examSectionsList.push({
                    exam_id: id,
                    main_cat: "0",
                    sub_cat: "0",
                    menu_title: list.menu_title,
                    no_ofquest: list.no_ofquest,
                    mark_perquest: list.mark_perquest,
                    tot_marks: list.tot_marks,
                    neg_mark: list.neg_mark,
                    ques_ans: d_ques_ans,
                    cut_off: list.cut_off,
                    sect_time: list.sect_time,
                    sect_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                });
            });

            old_sections.forEach(async (list) => {
                let obj = {
                    exam_id: id,
                    main_cat: "0",
                    sub_cat: "0",
                    menu_title: list.menu_title,
                    no_ofquest: list.no_ofquest,
                    mark_perquest: list.mark_perquest,
                    tot_marks: list.tot_marks,
                    neg_mark: list.neg_mark,
                    ques_ans: d_ques_ans,
                    cut_off: list.cut_off,
                    sect_time: list.sect_time,
                    sect_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                };
                await db.ExamSectionDetails.update(
                    obj,
                    { where: { sect_id: list.sect_id } },
                    { transaction: t }
                )
            });

            let sect_ids = _.pluck(old_sections, 'sect_id');
            await db.ExamSectionDetails.destroy({ where: { sect_id: { [Op.notIn]: sect_ids }, exam_id: id } })
            // 3. tbl__exam_sectdetails insert
            let bulkdata = await db.ExamSectionDetails.bulkCreate(examSectionsList, {
                transaction: t,
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (quest_type == 'AUTO') {
                let automaticlist = [];
                let increment = 0;
                if (bulkdata) {
                    bulkdata.forEach((data) => {
                        let questionbank = sections[increment].questionbank;
                        for (let i = 0; i < questionbank.length; i++) {
                            automaticlist.push({
                                examid: id,
                                sectid: data.sect_id,
                                catid: questionbank[i].maincategoryId,
                                subcatid: questionbank[i].subcategoryId,
                                noofquestions: questionbank[i].noofquest,
                                questionlevel: exam.exam_level,
                                activestatus: 'Y',
                                createdby: req.user.id,
                                createdtimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                            })
                        }
                        increment = increment + 1;
                    });
                    let automaticdata = await db.AutomaticQuestionDetails.bulkCreate(automaticlist, {
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    let examquestionslist = [];
                    let check = 0;
                    for (const automatic of automaticdata) {
                        const [questionsdata] = await db.sequelize.query(`SELECT * from tbl__question WHERE cat_id = ${automatic.catid} 
                    and sub_id = ${automatic.subcatid} and quest_level in (${automatic.questionlevel}) and qid
                    not in (SELECT qid from tbl__examquestions 
                        WHERE exam_id = ${automatic.examid} and sect_id = ${automatic.sectid} and exam_queststatus = 'Y') 
                        ORDER BY RAND() LIMIT ${automatic.noofquestions}`,
                            { transaction: t }
                        );
                        if (questionsdata.length != automatic.noofquestions) {
                            check = 1;
                        }
                        if (check == 0) {
                            questionsdata.forEach((question) => {
                                examquestionslist.push({
                                    exam_id: automatic.examid,
                                    exam_cat: exam.exam_cat,
                                    exam_subcat: exam.exam_sub,
                                    sect_id: automatic.sectid,
                                    exam_name: exam.exam_name,
                                    exam_code: exam.exam_code,
                                    quest_type: exam.quest_type,
                                    quest_assigned_type: req.user.logintype,
                                    quest_assigned_id: req.user.id,
                                    quest_assigned_name: req.user.username,
                                    qid: question.qid,
                                    cat_id: question.cat_id,
                                    sub_id: question.sub_id,
                                    q_type: question.q_type,
                                    question: question.question,
                                    quest_desc: question.quest_desc,
                                    opt_type1: question.opt_type1,
                                    opt_type2: question.opt_type2,
                                    opt_type3: question.opt_type3,
                                    opt_type4: question.opt_type4,
                                    opt_type5: question.opt_type5,
                                    opt_1: question.opt_1,
                                    opt_2: question.opt_2,
                                    opt_3: question.opt_3,
                                    opt_4: question.opt_4,
                                    opt_5: question.opt_5,
                                    crt_ans: question.crt_ans,
                                    quest_level: question.quest_level,
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
                            })
                        }
                    }
                    await db.ExamQuestions.bulkCreate(examquestionslist, {
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                }
            }

            res.send({ message: "Exam Updated Success !!!" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Update Bank Exam : ${error.message}`);
            next(error);
        }
    },

    // 6. Update Sectional Exam
    updateSectionalExamById: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { id } = req.params;
            const {
                exam_cat,
                exam_sub,
                exam_sub_sub,
                exam_name,
                exam_slug,
                assign_test_type,
                exam_type,
                exam_code,
                exam_level,
                sect_cutoff,
                sect_timing,
                tot_questions,
                tot_mark,
                mark_perquest,
                neg_markquest,
                total_time,
                quest_type,
                exam_type_cat,
                exam_type_id,
                exam_pos,
                payment_flag,
                selling_price,
                offer_price,
                ip_addr,
                sections,
                startDate,
                endDate
            } = req.body;
            if (
                !exam_cat ||
                !exam_sub ||
                !exam_sub_sub ||
                !exam_name ||
                !exam_slug ||
                !assign_test_type ||
                !exam_type ||
                !exam_code ||
                !exam_level ||
                !sect_cutoff ||
                !sect_timing ||
                !tot_questions ||
                !tot_mark ||
                !mark_perquest ||
                !neg_markquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !ip_addr ||
                !sections
            )
                throw createError.BadRequest();

            await db.Exams.update(
                {
                    exam_cat,
                    exam_sub,
                    exam_sub_sub,
                    exam_name,
                    exam_slug,
                    assign_test_type,
                    exam_type,
                    exam_code,
                    exam_level,
                    sect_cutoff,
                    sect_timing,
                    tot_questions,
                    tot_mark,
                    mark_perquest,
                    neg_markquest,
                    total_time,
                    quest_type,
                    exam_type_cat,
                    exam_type_id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    payment_flag,
                    selling_price,
                    offer_price,
                    ip_addr,
                    startDate,
                    endDate,
                    last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
                { where: { exam_id: id } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            let exam = await db.Exams.findOne({
                where: { exam_id: id },
            });

            let old_sections = sections.filter(s => s.sect_id);
            let new_sections = sections.filter(s => !s.sect_id);
            let examSectionsList = [];
            new_sections.forEach((list) => {
                examSectionsList.push({
                    exam_id: id,
                    main_cat: "0",
                    sub_cat: "0",
                    menu_title: list.menu_title,
                    no_ofquest: list.no_ofquest,
                    mark_perquest: list.mark_perquest,
                    tot_marks: list.tot_marks,
                    neg_mark: list.neg_mark,
                    ques_ans: list.ques_ans,
                    cut_off: list.cut_off,
                    sect_time: list.sect_time,
                    sect_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                });
            });

            old_sections.forEach(async (list) => {
                let obj = {
                    exam_id: id,
                    main_cat: "0",
                    sub_cat: "0",
                    menu_title: list.menu_title,
                    no_ofquest: list.no_ofquest,
                    mark_perquest: list.mark_perquest,
                    tot_marks: list.tot_marks,
                    neg_mark: list.neg_mark,
                    ques_ans: d_ques_ans,
                    cut_off: list.cut_off,
                    sect_time: list.sect_time,
                    sect_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                };
                await db.ExamSectionDetails.update(
                    obj,
                    { where: { sect_id: list.sect_id } },
                    { transaction: t }
                )
            });

            let sect_ids = _.pluck(old_sections, 'sect_id');
            await db.ExamSectionDetails.destroy({ where: { sect_id: { [Op.notIn]: sect_ids }, exam_id: id } })
            // 3. tbl__exam_sectdetails insert
            let bulkdata = await db.ExamSectionDetails.bulkCreate(examSectionsList, {
                transaction: t,
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (quest_type == 'AUTO') {
                let automaticlist = [];
                let increment = 0;
                if (bulkdata) {
                    bulkdata.forEach((data) => {
                        let questionbank = sections[increment].questionbank;
                        for (let i = 0; i < questionbank.length; i++) {
                            automaticlist.push({
                                examid: id,
                                sectid: data.sect_id,
                                catid: questionbank[i].maincategoryId,
                                subcatid: questionbank[i].subcategoryId,
                                noofquestions: questionbank[i].noofquest,
                                questionlevel: exam.exam_level,
                                activestatus: 'Y',
                                createdby: req.user.id,
                                createdtimestamp: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                            })
                        }
                        increment = increment + 1;
                    });
                    let automaticdata = await db.AutomaticQuestionDetails.bulkCreate(automaticlist, {
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    let examquestionslist = [];
                    let check = 0;
                    for (const automatic of automaticdata) {
                        const [questionsdata] = await db.sequelize.query(`SELECT * from tbl__question WHERE cat_id = ${automatic.catid} 
                    and sub_id = ${automatic.subcatid} and quest_level in (${automatic.questionlevel}) and qid
                    not in (SELECT qid from tbl__examquestions 
                        WHERE exam_id = ${automatic.examid} and sect_id = ${automatic.sectid} and exam_queststatus = 'Y') 
                        ORDER BY RAND() LIMIT ${automatic.noofquestions}`,
                            { transaction: t }
                        );
                        if (questionsdata.length != automatic.noofquestions) {
                            check = 1;
                        }
                        console.log(check);
                        if (check == 0) {
                            questionsdata.forEach((question) => {
                                examquestionslist.push({
                                    exam_id: automatic.examid,
                                    exam_cat: exam.exam_cat,
                                    exam_subcat: exam.exam_sub,
                                    sect_id: automatic.sectid,
                                    exam_name: exam.exam_name,
                                    exam_code: exam.exam_code,
                                    quest_type: exam.quest_type,
                                    quest_assigned_type: req.user.logintype,
                                    quest_assigned_id: req.user.id,
                                    quest_assigned_name: req.user.username,
                                    qid: question.qid,
                                    cat_id: question.cat_id,
                                    sub_id: question.sub_id,
                                    q_type: question.q_type,
                                    question: question.question,
                                    quest_desc: question.quest_desc,
                                    opt_type1: question.opt_type1,
                                    opt_type2: question.opt_type2,
                                    opt_type3: question.opt_type3,
                                    opt_type4: question.opt_type4,
                                    opt_type5: question.opt_type5,
                                    opt_1: question.opt_1,
                                    opt_2: question.opt_2,
                                    opt_3: question.opt_3,
                                    opt_4: question.opt_4,
                                    opt_5: question.opt_5,
                                    crt_ans: question.crt_ans,
                                    quest_level: question.quest_level,
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
                            })
                            console.log(examquestionslist);
                        }
                    }
                    console.log('test');
                    //if (examquestionslist.length > 0) {
                    await db.ExamQuestions.bulkCreate(examquestionslist, {
                        transaction: t,
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                    /*}
                    else{
                        console.log("no sufficient questions");
                    }*/

                }
            }

            res.send({ message: "Exam Updated Success !!!" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Update Bank Exam : ${error.message}`);
            next(error);
        }
    },
    // 7. Update Exam Status 'Inactive / Active / Delete'
    updateStatusById: async (req, res, next) => {
        try {
            let { exam_id, status } = req.body;
            if (!exam_id || !status) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.Exams.update(
                    { exam_status: status },
                    { where: { exam_id: exam_id } },
                    { transaction: t }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                res.send({ message: "Updated Success" });
            });
        } catch (error) {
            logger.error(`Error at Update Exam Status : ${error.message}`);
            next(error);
        }
    },

    // Get Previous Year
    getPreviousYear: async (req, res, next) => {
        try {
            let { exam_cat, exam_sub } = req.body;
            if (!exam_cat || !exam_sub) throw createError.BadRequest();

            const { count, rows } = await db.Exams.findAndCountAll({
                where: {
                    exam_type: "C",
                    exam_cat: exam_cat,
                    exam_sub: exam_sub,
                    exam_status: "Y",
                },
                order: [["exam_id"]],
            });
            if (!rows) throw createError.NotFound("Previous year question Not Found !!!");
            res.send({ count, Exam: rows });
        } catch (error) {
            logger.error(`Error at Get Previous Year : ${error.message}`);
            next(error);
        }
    },

    // Get Test Types
    getTestTypes: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__examtypes where extype_id not in (
                    select exam_type_id from tbl__exam 
                     where exam_type_cat='T'  AND assign_test_type ='D' AND exam_status !='D'
                     and exam_sub_sub=?)
                     and exa_cat_id=? and extype_status='Y' order by extype_id asc
            `,
                { replacements: [sub_cat_id, sub_cat_id] }
            );

            if (!category) throw createError.NotFound("Test types Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get Test Types : ${error.message}`);
            next(error);
        }
    },

    getChapters: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__examchapters where chapt_id 
                not in (
                select exam_type_id from tbl__exam 
                 where exam_type_cat='C'  AND assign_test_type ='D' AND exam_status !='D'
                 and exam_sub_sub=?)
                 and exa_cat_id=? and chapter_status='Y' order by chapt_id asc
            `,
                { replacements: [sub_cat_id, sub_cat_id] }
            );

            if (!category) throw createError.NotFound("chapters list Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get Chapters : ${error.message}`);
            next(error);
        }
    },

    getTestTypesEdit: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__examtypes where 
                      exa_cat_id=? and extype_status='Y' order by extype_id asc
            `,
                { replacements: [sub_cat_id] }
            );

            if (!category) throw createError.NotFound("Test types Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get Test Types Edit : ${error.message}`);
            next(error);
        }
    },

    getChaptersEdit: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__examchapters where 
                exa_cat_id=? and chapter_status='Y' order by chapt_id asc
            `,
                { replacements: [sub_cat_id] }
            );

            if (!category) throw createError.NotFound("chapters list Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get Chapters Edit : ${error.message}`);
            next(error);
        }
    },

    // 11. Get Exam Search Result
    getSearchResult: async (req, res, next) => {
        try {
            let {
                qType,
                difficulty,
                faculty,
                searchString,
                exam_cat,
                exam_sub,
                exam_sub_sub,
                status,
                examtype
            } = req.body;

            if (
                qType == null ||
                difficulty == null ||
                faculty == null ||
                searchString == null ||
                exam_cat == null ||
                exam_sub == null ||
                exam_sub_sub == null
            )
                throw createError.BadRequest();

            if (!!searchString) searchString = `%${searchString}%`;

            if (qType != "" && difficulty == "" && faculty == "" && searchString == "") {
                conditions = `a.quest_type = '${qType}' AND`;
            } else if (qType != "" && difficulty != "" && faculty == "" && searchString == "") {
                conditions = `a.quest_type = '${qType}' AND  a.exam_level = '${difficulty}' AND`;
            } else if (qType != "" && difficulty != "" && faculty != "" && searchString == "") {
                conditions = `a.quest_type = '${qType}' AND  a.exam_level = '${difficulty}' AND a.quest_add_id = '${faculty}' AND`;
            } else if (qType != "" && difficulty != "" && faculty != "" && searchString != "") {
                conditions = `a.quest_type = '${qType}' AND  a.exam_level = '${difficulty}' AND a.quest_add_id = '${faculty}' AND a.question LIKE '${searchString}' AND`;
            } else if (qType == "" && difficulty != "" && faculty == "" && searchString == "") {
                conditions = `a.exam_level = '${difficulty}' AND`;
            } else if (qType == "" && difficulty == "" && faculty != "" && searchString == "") {
                conditions = `a.exam_add_id = '${faculty}' AND`;
            } else if (qType == "" && difficulty == "" && faculty == "" && searchString != "") {
                conditions = `a.exam_name LIKE '${searchString}' AND`;
            } else {
                conditions = ``;
            }

            const [exams, metadata] = await db.sequelize.query(
                `SELECT a.*,COUNT(b.exam_id) as totalassigned FROM tbl__exam as a 
                left join tbl__examquestions as b on a.exam_id=b.exam_id and b.exam_queststatus='Y'
           
                WHERE ${conditions} a.exam_cat = ${exam_cat} AND a.exam_sub = ${exam_sub}
                 AND a.exam_sub_sub = ${exam_sub_sub} AND a.exam_status = '${status}' 
                 AND a.exam_type = '${examtype}' 
                 group by a.exam_id
            ORDER BY a.exam_id;`,
                {
                    replacements: [
                        qType,
                        difficulty,
                        faculty,
                        searchString,
                        exam_cat,
                        exam_sub,
                        exam_sub_sub,
                    ],
                }
            );

            if (!exams) res.send({ count, exams: "Not Found !!!" });
            res.send({ count: exams.length, exams });

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
                },
            });
            if (count == 0) res.send({ count, exams: "Not Found !!!" });
            res.send({ count, exams: rows });
            */
        } catch (error) {
            logger.error(`Error at Get Exam Search Res : ${error.message}`);
            next(error);
        }
    },

    getSection: async (req, res, next) => {
        try {
            let { exam_id } = req.params;
            if (exam_id == 0 || !exam_id) throw createError.BadRequest();

            const { count, rows } = await db.ExamSectionDetails.findAndCountAll({
                include: [
                    {
                        model: db.AutomaticQuestionDetails,
                    },
                ],
                where: {
                    exam_id: exam_id,
                },
                order: [["sect_id"]],
            });

            if (!rows) {
                throw createError.NotFound("Exam Section Not Found !!!");
            }
            res.send({ count, Section: rows });
        } catch (error) {
            logger.error(`Error at Get Section : ${error.message}`);
            next(error);
        }
    },

    // 15. Get All Exam Count Only
    getAllExamCount: async (req, res, next) => {
        try {
            let { type, status, exa_cat_id } = req.body;
            if (!type || !status || !exa_cat_id) throw createError.BadRequest();

            const count = await db.Exams.count({
                where: {
                    exam_type: type,
                    exam_status: status,
                    exam_sub_sub: exa_cat_id,
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get All Exam Count Only : ${error.message}`);
            next(error);
        }
    },

    moveExam: async (req, res, next) => {
        try {
            let { exam_id, exa_cat, exam_sub, exam_sub_sub } = req.body;
            console.log("id", req.body)
            if (!exam_id || !exa_cat || !exam_sub || !exam_sub_sub)
                throw createError.BadRequest();

            const { count, rows } = await db.Exams.findAndCountAll({
                where: {
                    exam_id: exam_id
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (!rows) res.send({ count, exams: "Not Found !!!" });
            if (rows) {
                await db.Exams.update(
                    {
                        exam_cat: exa_cat,
                        exam_sub,
                        exam_sub_sub,
                        last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { where: { exam_id: exam_id } }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                await db.ExamQuestions.update(
                    {
                        exam_cat: exa_cat,
                        exam_subcat: exam_sub,
                        last_update: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { where: { exam_id: exam_id, exam_queststatus: 'Y' } }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                res.send({ message: "Exam Updated Success !!!" });
            }
            /*const [exams] = await db.sequelize.query(
                `SELECT * FROM tbl__exam where exam_id = ?`,
                {
                    replacements: [
                        exam_id
                    ],
                }
            );*/

            /*if (!rows) res.send({ count, exams: "Not Found !!!" });
            res.send({ rows });*/

        } catch (error) {
            logger.error(`Error at Get Exam Search Res : ${error.message}`);
            next(error);
        }
    },

    getAllAttendExam: async (req, res, next) => {
        try {
            const { count, rows } = await db.Examtakenlist.findAndCountAll({
                where: {
                    exam_status: 'C'
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (!rows) res.send({ count, exams: "Not Found !!!" });
            res.send({ rows });
        } catch (error) {
            logger.error(`Error at Get Exam By Id : ${error.message}`);
            next(error);
        }
    },

    getAllPaidExam: async (req, res, next) => {
        try {
            const { count, rows } = await db.OrderItems.findAndCountAll({
                where: {
                    payment_status: 1,
                    order_type: 'Exam'
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (!rows) res.send({ count, exams: "Not Found !!!" });
            res.send({ rows });
        } catch (error) {
            logger.error(`Error at Get Exam By Id : ${error.message}`);
            next(error);
        }
    },

    getAutomaticRows: async (req, res, next) => {
        try {
            let { exam_id } = req.params;
            if (exam_id == 0 || !exam_id) throw createError.BadRequest();

            const { count, rows } = await db.AutomaticQuestionDetails.findAndCountAll({
                where: {
                    examid: exam_id,
                }
            });

            if (!rows) {
                throw createError.NotFound("Exam Section Not Found !!!");
            }
            res.send({ count, automaticquestions: rows });
        } catch (error) {
            logger.error(`Error at Get Section : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Exam By Id
    examDownload: async (req, res, next) => {
        try {
            let { exam_id, isShowCrtAns } = req.query;
            let isQcAdmin = true;
            if (exam_id === 0) throw createError.BadRequest();
            let [questions] = await db.sequelize.query(
                `SELECT 
                        E.exam_name AS examName,
                        MC.exa_cat_name AS masterCatName,
                        C.exa_cat_name AS mainCatName,
                        CS.exa_cat_name AS subCatName,
                        CT.chapter_name AS chaptName,
                        TY.extest_type AS typeName,
                        EQ.*
                    FROM
                        tbl__exam AS E
                        INNER JOIN tbl__exam_category AS MC ON MC.exa_cat_id=E.exam_cat
                        INNER JOIN tbl__exam_category AS C ON C.exa_cat_id=E.exam_sub
                        INNER JOIN tbl__exam_category AS CS ON CS.exa_cat_id=E.exam_sub_sub
                        LEFT JOIN tbl__examchapters AS CT ON CT.chapt_id=E.exam_type_id AND E.exam_type_cat="C"
                        LEFT JOIN tbl__examtypes AS TY ON TY.extype_id=E.exam_type_id AND E.exam_type_cat="T"
                        INNER JOIN tbl__examquestions AS EQ ON EQ.exam_id=E.exam_id AND exam_queststatus="Y"
                    WHERE
                        E.exam_id=${exam_id}
                    `
            );

            let [sect] = await db.sequelize.query(
                `
                    SELECT
                        *
                    FROM
                        tbl__exam_sectdetails
                    WHERE
                        exam_id=${exam_id}
                `
            )

            await asyncForEach(questions, async (oneDoc, index) => {
                oneDoc.index = index;
                oneDoc.rowNo = index + 1;

                if (oneDoc.question && oneDoc.q_type === "T") {
                    oneDoc.question = decode(oneDoc.question);
                } else if (oneDoc.question && oneDoc.q_type !== "T" && isQcAdmin) {
                    oneDoc.question = `<img src='https://questioncloud.in/uploads/question/${oneDoc.question}' />`;
                } else if (oneDoc.question && oneDoc.q_type !== "T" && isSchoolAdmin) {
                    oneDoc.question = `<img src='https://questioncloud.in/uploads/schoolquestions/${oneDoc.question}' />`;
                }

                if (oneDoc.opt_1 && oneDoc.opt_type1 === "T") {
                    oneDoc.opt_1 = decode(oneDoc.opt_1);
                } else if (oneDoc.opt_1 && oneDoc.opt_type1 !== "T" && isQcAdmin) {
                    oneDoc.opt_1 = `<img src='https://questioncloud.in/uploads/question/${oneDoc.opt_1}' />`;
                } else if (oneDoc.opt_1 && oneDoc.opt_type1 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_1 = `<img src='https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_1}' />`;
                }

                if (oneDoc.opt_2 && oneDoc.opt_type2 === "T") {
                    oneDoc.opt_2 = decode(oneDoc.opt_2);
                } else if (oneDoc.opt_2 && oneDoc.opt_type2 !== "T" && isQcAdmin) {
                    oneDoc.opt_2 = `<img src='https://questioncloud.in/uploads/question/${oneDoc.opt_2}' />`;
                } else if (oneDoc.opt_1 && oneDoc.opt_type2 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_2 = `<img src='https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_2}' />`;
                }

                if (oneDoc.opt_3 && oneDoc.opt_type3 === "T") {
                    oneDoc.opt_3 = decode(oneDoc.opt_3);
                } else if (oneDoc.opt_3 && oneDoc.opt_type3 !== "T" && isQcAdmin) {
                    oneDoc.opt_3 = `<img src='https://questioncloud.in/uploads/question/${oneDoc.opt_3}' />`;
                } else if (oneDoc.opt_3 && oneDoc.opt_type3 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_3 = `<img src='https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_3}' />`;
                }

                if (oneDoc.opt_4 && oneDoc.opt_type4 === "T") {
                    oneDoc.opt_4 = decode(oneDoc.opt_4);
                } else if (oneDoc.opt_4 && oneDoc.opt_type4 !== "T" && isQcAdmin) {
                    oneDoc.opt_4 = `<img src='https://questioncloud.in/uploads/question/${oneDoc.opt_4}' />`;
                } else if (oneDoc.opt_4 && oneDoc.opt_type4 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_4 = `<img src='https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_4}' />`;
                }

                if (oneDoc.opt_5 && oneDoc.opt_type5 === "T") {
                    oneDoc.opt_5 = decode(oneDoc.opt_5);
                } else if (oneDoc.opt_5 && oneDoc.opt_type5 !== "T" && isQcAdmin) {
                    oneDoc.opt_5 = `<img src='https://questioncloud.in/uploads/question/${oneDoc.opt_5}' />`;
                } else if (oneDoc.opt_5 && oneDoc.opt_type5 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_5 = `<img src='https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_5}' />`;
                }

                if (isShowCrtAns && (isShowCrtAns === 'true' || isShowCrtAns === true) && oneDoc.crt_ans) {
                    if (oneDoc.crt_ans === "1") {
                        oneDoc.crt_ans_text = oneDoc.opt_1;
                    }
                    if (oneDoc.crt_ans === "2") {
                        oneDoc.crt_ans_text = oneDoc.opt_2;
                    }
                    if (oneDoc.crt_ans === "3") {
                        oneDoc.crt_ans_text = oneDoc.opt_3;
                    }
                    if (oneDoc.crt_ans === "4") {
                        oneDoc.crt_ans_text = oneDoc.opt_4;
                    }
                    if (oneDoc.crt_ans === "5") {
                        oneDoc.crt_ans_text = oneDoc.opt_5;
                    }
                }
            });

            let html;
            if (sect && sect.length > 0) {
                await asyncForEach(sect, async (s, index) => {
                    let questionsFilter = questions.filter( q => q.sect_id === s.sect_id );
                    await asyncForEach(questionsFilter, async (q, qIndex) => {
                        q.rowNo = qIndex+1;
                    })
                    s.questions = questionsFilter;
                });
                html = secTemplate({
                    data: sect,
                    masterCatName: questions[0].masterCatName,
                    mainCatName: questions[0].mainCatName,
                    subCatName: questions[0].subCatName,
                    examName: questions[0].examName,
                    typeName: questions[0].typeName,
                    chaptName: questions[0].chaptName,
                    headerName: 'Question Cloud',
                    rowCount: questions.length,
                    isShowCrtAns: isShowCrtAns && (isShowCrtAns === 'true' || isShowCrtAns === true) ? true : false
                });
            }else{
                html = template({
                    data: questions,
                    masterCatName: questions[0].masterCatName,
                    mainCatName: questions[0].mainCatName,
                    subCatName: questions[0].subCatName,
                    examName: questions[0].examName,
                    typeName: questions[0].typeName,
                    chaptName: questions[0].chaptName,
                    headerName: 'Question Cloud',
                    rowCount: questions.length,
                    isShowCrtAns: isShowCrtAns && (isShowCrtAns === 'true' || isShowCrtAns === true) ? true : false
                });
            }

            pdf.create(html).toFile(path.resolve(templatesPath, `examQuestion.pdf`), function (err, data1) {
                if (err) {
                    console.log(err);
                    res.send({ statusCode: 201, message: 'Create pdf failed.' });
                } else {
                    fs.readFile(path.resolve(templatesPath, `examQuestion.pdf`), function (err, data2) {
                        res.header('Content-Type', 'application/pdf');
                        req.header('Content-Transfer-Encoding', 'Binary');
                        res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
                        res.send(data2);
                    });
                }
            });

            // const browser = await puppeteer.launch();
            // // const browser = await puppeteer.launch({
            // //     executablePath: '/usr/bin/chromium-browser',
            // //     args: ['--no-sandbox', '--disable-dev-shm-usage'],
            // // });
            // const page = await browser.newPage();
            // await page.setContent(html);
            // await page.pdf({ path: path.resolve(templatesPath, `examQuestion.pdf`), format: 'A4' });
            // await browser.close();
            // console.log("PDF Generated");
            // await path.resolve(templatesPath, `examQuestion.pdf`);
            // fs.readFile(path.join(templatesPath, 'examQuestion.pdf'), function (err, data2) {
            //     res.header('Content-Type', 'application/pdf');
            //     res.header('Content-Transfer-Encoding', 'Binary');
            //     res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
            //     res.send(data2);
            // });
        } catch (error) {
            logger.error(`Error at Get Exam By Id : ${error.message}`);
            next(error);
        }
    },
};
