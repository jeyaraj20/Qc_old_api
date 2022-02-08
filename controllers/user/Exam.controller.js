const db = require("../../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../../helper/userLogger");
const { SendResultMail, SendResultSms, SendContactUsMail } = require("../../helper/general_helper");

module.exports = {
    // 1. Set Exam Taken User
    setExamTaken: async (req, res, next) => {
        try {
            let { exam_id, ip_addr } = req.body;
            if (!exam_id || !ip_addr) throw createHttpError.BadRequest();
            const { count, rows } = await db.Exams.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    exam_status: "Y",
                },
            });

            if (count > 0) {
                console.log(req.user);
                console.log("rows",rows[0]);
                await db.Examtakenlist.create({
                    stud_id: req.user.id,
                    exam_id: exam_id,
                    exam_type: rows[0].exam_type,
                    exam_type_cat: rows[0].exam_type_cat,
                    tot_quest: rows[0].tot_questions,
                    post_mark: rows[0].mark_perquest,
                    neg_mark: rows[0].neg_markquest,
                    exam_type_id: rows[0].exam_type_id,
                    start_time: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    exam_status: "S",
                    ip_addr: ip_addr,
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                })
                    .then((message) => res.send({ message, examdata: rows }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            }
        } catch (error) {
            logger.error(`Error at Set Exam Taken User : ${error.message}`);
            next(error);
        }
    },

    // Get Exam Taken User
    getExamTaken: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();

            const [examtaken] = await db.sequelize.query(
                `select * from tbl__examtaken_list as a 
                    inner join tbl__exam as b on a.exam_id=b.exam_id
                    left join tbl__examchapters as c on b.exam_type_id=c.chapt_id
                    left join tbl__examtypes as d on b.exam_type_id=d.extype_id
                    where a.taken_id=? and a.exam_status='S' and a.stud_id=` + req.user.id,
                { replacements: [taken_id] }
            );
            const [examquestion] = await db.sequelize.query(
                `select c.passage_question,c.passage_quest_desc,c.passage_opt_1,c.passage_opt_2,c.passage_opt_3,c.passage_opt_4,c.passage_opt_5,
                a.exq_id,a.exam_id,a.sect_id,a.qid,a.q_type,a.question,a.quest_desc,a.opt_type1,a.opt_type2,a.opt_type3,a.opt_type4,a.opt_type5,
                a.opt_1,a.opt_2,a.opt_3,a.opt_4,a.opt_5
                ,b.attend_ans,b.review_val from tbl__examquestions as a 
                left JOIN tbl__passage_question as c on c.question_ref_id = a.qid
                left join tbl__exam_result as b on a.exq_id=b.quest_id and b.exam_id=?
                and b.taken_id=?
                where a.exam_id=?  and a.exam_queststatus='Y'
                order by a.sect_id,a.exq_id;`,
                { replacements: [examtaken[0].exam_id, taken_id, examtaken[0].exam_id] }
            );

            let section = await db.ExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: examtaken[0].exam_id,
                    no_ofquest: { [Op.gt]: 0 },
                },
                order: [["sect_id"]],
            });
            if (!examtaken) {
                throw createError.NotFound("exam taken not Found !!!");
            }
            res.send({
                examtakencount: examtaken.length,
                examtaken,
                count: examquestion.length,
                examquestion: examquestion,
                section: section.rows,
                timenow: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            });
        } catch (error) {
            logger.error(`Error at Get Exam Taken User : ${error.message}`);
            next(error);
        }
    },

    // Exam Complete User
    getExamComplete: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();

            const [examtaken] = await db.sequelize.query(
                `select * from tbl__examtaken_list as a 
                    inner join tbl__exam as b on a.exam_id=b.exam_id
                    left join tbl__examchapters as c on b.exam_type_id=c.chapt_id
                    left join tbl__examtypes as d on b.exam_type_id=d.extype_id
                    where a.taken_id=? and a.exam_status='C' and a.stud_id=` + req.user.id,
                { replacements: [taken_id] }
            );
            if (!examtaken) {
                throw createError.NotFound("exam taken not Found !!!");
            }
            res.send({
                examtakencount: examtaken.length,
                examtaken,
                timenow: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            });
        } catch (error) {
            logger.error(`Error at Exam Complete User : ${error.message}`);
            next(error);
        }
    },

    // Exam Taken Answer User
    getExamTakenAnswer: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();

            const [examtaken] = await db.sequelize.query(
                `select * from tbl__examtaken_list as a 
                    inner join tbl__exam as b on a.exam_id=b.exam_id
                    left join tbl__examchapters as c on b.exam_type_id=c.chapt_id
                    left join tbl__examtypes as d on b.exam_type_id=d.extype_id
                    where a.taken_id=? and a.exam_status='C' and a.stud_id=` + req.user.id,
                { replacements: [taken_id] }
            );
            if (!examtaken) {
                throw createError.NotFound("exam taken not Found !!!");
            }

            const [examquestion] = await db.sequelize.query(
                `select a.exq_id,a.exam_id,a.sect_id,a.qid,a.q_type,a.question,
                a.quest_desc,a.opt_type1,a.opt_type2,a.opt_type3,a.opt_type4,a.opt_type5,
                a.opt_1,a.opt_2,a.opt_3,a.opt_4,a.opt_5,a.crt_ans
                ,b.attend_ans,b.review_val from tbl__examquestions as a 
                left join tbl__exam_result as b on a.exq_id=b.quest_id and b.exam_id=?
                and b.taken_id=?
                where a.exam_id=?  and a.exam_queststatus='Y'
                group by a.exq_id
                order by a.sect_id,a.exq_id;`,
                { replacements: [examtaken[0].exam_id, taken_id, examtaken[0].exam_id] }
            );

            let section = await db.ExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: examtaken[0].exam_id,
                },
                order: [["sect_id"]],
            });
            res.send({
                examtakencount: examtaken.length,
                examtaken,
                count: examquestion.length,
                examquestion: examquestion,
                section: section.rows,
                timenow: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            });
        } catch (error) {
            logger.error(`Error at Exam Taken Answer User : ${error.message}`);
            next(error);
        }
    },

    // Set Exam Result User
    setExamResult: async (req, res, next) => {
        try {
            let { exq_id, exam_id, taken_id, ansval, reveval, ipaddress, sect_id } = req.body;
            if (!exq_id || !exam_id || !taken_id || !reveval || !ipaddress)
                throw createHttpError.BadRequest();

            const { rows } = await db.ExamQuestions.findAndCountAll({
                where: {
                    exq_id: exq_id,
                    exam_queststatus: "Y",
                },
                order: [["exam_id"]],
            });

            const examdata = await db.Exams.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    exam_status: "Y",
                },
                order: [["exam_id"]],
            });

            const sectiondata = await db.ExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    sect_id: sect_id,
                },
            });

            const examresultdata = await db.Examresult.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    stud_id: req.user.id,
                    taken_id: taken_id,
                    quest_id: exq_id,
                },
            });
            var crt_ans = rows[0].crt_ans;
            if (sect_id == 0) {
                var mark_perquest = examdata.rows[0].mark_perquest;
                var neg_markquest = examdata.rows[0].neg_markquest;
            } else {
                var mark_perquest = sectiondata.rows[0].mark_perquest;
                var neg_markquest = sectiondata.rows[0].neg_mark;
            }

            if (examresultdata.rows.length == 0) {
                await db.Examresult.create({
                    stud_id: req.user.id,
                    taken_id: taken_id,
                    exam_id: exam_id,
                    quest_id: exq_id,
                    sect_id: sect_id,
                    attend_ans: ansval,
                    review_val: reveval,
                    crt_ans: crt_ans,
                    crt_mark: mark_perquest,
                    neg_mark: neg_markquest,
                    attend_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    ipaddress: ipaddress,
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                })
                    .then((message) => res.send({ message }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            } else {
                var result_id = examresultdata.rows[0].result_id;

                await db.Examresult.update(
                    {
                        attend_ans: ansval,
                        review_val: reveval,
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { where: { result_id: result_id } }
                )
                    .then((message) => res.send({ message }))
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            }
        } catch (error) {
            logger.error(`Error at Set Exam Result User : ${error.message}`);
            next(error);
        }
    },

    // Remove Exam Result User
    removeExamResult: async (req, res, next) => {
        try {
            let { exq_id, exam_id, taken_id } = req.body;
            if (!exq_id || !exam_id || !taken_id ){
                throw createHttpError.BadRequest();   
            }
            const examresultdata = await db.Examresult.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    stud_id: req.user.id,
                    taken_id: taken_id,
                    quest_id: exq_id,
                },
            });
            if (examresultdata.rows.length > 0) {
                var result_id = examresultdata.rows[0].result_id;
                await db.Examresult.destroy(
                    { where: { result_id: result_id } }
                ).then((message) => res.send({ message }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            } else {
                throw createError.InternalServerError("No Exam found!");
            }
        } catch (error) {
            logger.error(`Error at Set Exam Result User : ${error.message}`);
            next(error);
        }
    },

    // Save Exam Result
    saveExamResult: async (req, res, next) => {
        try {
            let { exq_id, exam_id, taken_id, ansval, reveval, ipaddress, sect_id } = req.body;
            if (!exq_id || !exam_id || !taken_id || !reveval || !ipaddress)
                throw createHttpError.BadRequest();

            const { rows } = await db.ExamQuestions.findAndCountAll({
                where: { exq_id: exq_id, exam_queststatus: "Y" },
                order: [["exam_id"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const sectiondata = await db.ExamSectionDetails.findAndCountAll({
                where: { exam_id, sect_id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const examdata = await db.Exams.findAndCountAll({
                where: { exam_id, exam_status: "Y" },
                order: [["exam_id"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const examresultdata = await db.Examresult.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    stud_id: req.user.id,
                    taken_id: taken_id,
                    quest_id: exq_id,
                },
            });
            var crt_ans = rows[0].crt_ans;
            var tot_question = examdata.rows[0].tot_questions;

            // Positive and Negative Marks
            let mark_perquest;
            let neg_markquest;
            if (sect_id == 0) {
                mark_perquest = examdata.rows[0].mark_perquest;
                neg_markquest = examdata.rows[0].neg_markquest;
            } else {
                mark_perquest = sectiondata.rows[0].mark_perquest;
                neg_markquest = sectiondata.rows[0].neg_mark;
            }

            //if (ansval != 0) {
            if (examresultdata.rows.length == 0) {
                await db.Examresult.create({
                    stud_id: req.user.id,
                    taken_id: taken_id,
                    exam_id: exam_id,
                    quest_id: exq_id,
                    sect_id: sect_id,
                    attend_ans: ansval,
                    review_val: reveval,
                    crt_ans: crt_ans,
                    crt_mark: mark_perquest,
                    neg_mark: neg_markquest,
                    attend_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    ipaddress: ipaddress,
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            } else {
                var result_id = examresultdata.rows[0].result_id;
                await db.Examresult.update(
                    {
                        attend_ans: ansval,
                        review_val: reveval,
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    },
                    { where: { result_id: result_id } }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            }
            //}

            // Total attend
            const totalAttend = await db.Examresult.count({ where: { taken_id } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const totalAttendwithanswer = await db.Examresult.count({ where: { taken_id, attend_ans: { [Op.gt]: 0 } } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            console.log("totalAttend ==> data", totalAttend);
            let totattend = totalAttend;
            let totalttendwithanswer = totalAttendwithanswer;
            let totnotattend = tot_question - totattend;

            //  Total Correct Answer
            const crtansw = await db.sequelize
                .query(
                    `SELECT COUNT(*) AS crtansw FROM tbl__exam_result WHERE taken_id = ?
                    AND attend_ans!=0 AND attend_ans = crt_ans AND exam_id = ?`,
                    { replacements: [taken_id, exam_id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            console.log("crtansw ==> data", crtansw);
            let totcrtansw = crtansw[0][0].crtansw;
            let totpostmark = totcrtansw * mark_perquest;

            // Total Wrong Answer
            const wrongansw = await db.sequelize
                .query(
                    `SELECT COUNT(*) AS wrongansw FROM tbl__exam_result WHERE taken_id = ?
                    AND exam_id = ? AND attend_ans!=0 AND NOT attend_ans <=> crt_ans`,
                    { replacements: [taken_id, exam_id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            console.log("wrongansw ==> data", wrongansw);

            let notanswered = tot_question - totalttendwithanswer;
            let totwrongansw = wrongansw[0][0].wrongansw;
            let totnegmark = totwrongansw * neg_markquest;
            let finalmark = totpostmark - totnegmark;
            // Final Data to be update
            let data = {
                tot_attend: totattend,
                not_attend: totalttendwithanswer,
                not_answered: notanswered,
                answ_crt: totcrtansw,
                answ_wrong: totwrongansw,
                tot_postimark: totpostmark,
                tot_negmarks: totnegmark,
                total_mark: finalmark,
            };
            console.log("examtaken list ==> data", data);
            // Update Examtakenlist Tbl
            await db.Examtakenlist.update(
                {
                    ...data,
                    end_time: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    exam_status: "C",
                },
                { where: { taken_id: taken_id } }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ message: "Updated Success" });

            /*
            const [exammark] = await db.sequelize.query(
                `select count(*) as fieldvalue, 'totalattend' as fieldname from tbl__exam_result
                where taken_id=? union
                select count(*) as fieldvalue, 'totalcorrect' as fieldname from tbl__exam_result
                where taken_id=? and (attend_ans = crt_ans) and attend_ans!=0
                union 
                select count(*) as fieldvalue,'totalwrong'as fieldname from tbl__exam_result
                where taken_id=? and (attend_ans !=crt_ans) and attend_ans!=0
                union
                select count(*)*crt_mark as fieldvalue, 'totalpostive' as fieldname from tbl__exam_result
                where taken_id=? and (attend_ans =crt_ans) and attend_ans!=0
                union 
                select count(*)*neg_mark as fieldvalue ,'totalnegative' as fieldname from tbl__exam_result
                where taken_id=? and (attend_ans !=crt_ans) and attend_ans!=0
                union 
                select count(*)*neg_mark as fieldvalue ,'totalnotanswered' as fieldname from tbl__exam_result
                where taken_id=? and attend_ans=0`,
                { replacements: [taken_id, taken_id, taken_id, taken_id, taken_id, taken_id] }
            );

            if (exammark.length == 6) {
                let tot_attend = exammark[0].fieldvalue;
                if (!tot_attend) tot_attend = 0;
                let answ_crt = exammark[1].fieldvalue;
                if (!answ_crt) answ_crt = 0;
                let answ_wrong = exammark[2].fieldvalue;
                if (!answ_wrong) answ_wrong = 0;
                let tot_postimark = exammark[3].fieldvalue;
                if (!tot_postimark) tot_postimark = 0.0;
                let tot_negmarks = exammark[4].fieldvalue;
                if (!tot_negmarks) tot_negmarks = 0.0;

                let not_answered = exammark[4].fieldvalue;
                if (!not_answered) not_answered = 0;

                let not_attend = tot_question - tot_attend;
                if (!not_attend) not_attend = 0;
                let total_mark = tot_postimark - tot_negmarks;
                if (!total_mark) total_mark = 0.0;
                console.log(tot_attend);
                console.log(not_attend);
                console.log(not_answered);
                console.log(answ_crt);
                console.log(answ_wrong);
                console.log(tot_postimark);
                console.log(tot_negmarks);
                console.log(total_mark);
                await db.Examtakenlist.update(
                    {
                        tot_attend: tot_attend,
                        not_attend: not_attend,
                        not_answered: not_answered,
                        answ_crt: answ_crt,
                        answ_wrong: answ_wrong,
                        tot_postimark: tot_postimark,
                        tot_negmarks: tot_negmarks,
                        total_mark: total_mark,
                        end_time: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        exam_status: "C",
                    },
                    { where: { taken_id: taken_id } }
                )
                    .then((result) => {
                        res.send({ message: "Updated Success" });
                    })
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
            }
            */
        } catch (error) {
            logger.error(`Error at Save User Result User : ${error.message}`);
            next(error);
        }
    },

    // Get Result User
    getResult: async (req, res, next) => {
        try {
            let sendSms = 1;
            let { taken_id, smsFlag } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();
            if (smsFlag && smsFlag == 0) sendSms = 0;
            // 1. Exam taken record by taken_id
            const result = await db.Examtakenlist.findOne({
                where: {
                    taken_id: taken_id,
                    exam_status: "C",
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            // 2. Cal total marks
            let totalMarks = result.tot_quest * result.post_mark;
            // 3. Get Rank for this totalMarks
            const rank = await db.Examtakenlist.count({
                where: {
                    exam_id: result.exam_id,
                    exam_status: "C",
                    total_mark: { [Op.gt]: result.total_mark },
                    taken_id: { [Op.ne]: taken_id },
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            // 4. Total Attended Students
            const totalAttend = await db.Examtakenlist.count({
                where: {
                    exam_id: result.exam_id,
                    exam_status: "C",
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            // 5. Get Exam name
            const examName = await db.Exams.findOne({
                where: { exam_id: result.exam_id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            let { examTitle, masterCategoryName, examname } = await getExamTitle(
                result.exam_id
            ).catch((err) => {
                examTitle = "";
                masterCategoryName = "";
                examname = "";
            });

            let title = masterCategoryName + ' >> ' + examTitle + ' >> ' + examname;

            if (result.exam_type == "C") {
                // 6. Send Respose
                if (!result) res.send({ status: false, message: "Exam Not Yet Completed !!!" });
                else {
                    let answered = result.tot_quest - result.not_answered
                    let data = {
                        totalQuestions: result.tot_quest,
                        totalMarks,
                        questionsSeen: result.tot_attend,
                        questionsAnswered: answered,
                        questionsNotAnswered: result.not_answered,
                        noOfCorrectAnswer: result.answ_crt,
                        noOfWrongAnswer: result.answ_wrong,
                        marksForCorrectAnswer: result.tot_postimark,
                        marksForWrongAnswer: result.tot_negmarks,
                        finalScore: result.total_mark,
                        rank: rank + 1,
                        totalRank: totalAttend,
                        examname: title
                    };
                    //  Email and SMS
                    let toEmailId = req.user.email;
                    let subject = "Scores Obtained";
                    let userName = req.user.name;
                    if (sendSms == 1) {
                        SendResultMail(toEmailId, subject, userName, data, title);
                        SendResultSms(req.user.mobile, req.user.name, data.finalScore, title);
                    }
                    res.send({ ...data, takendetail: result });
                }
            } else {
                const [sectiondata] = await db.sequelize
                    .query(
                        `SELECT * FROM tbl__exam_sectdetails WHERE exam_id = ? and no_ofquest > 0`,
                        { replacements: [result.exam_id] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                const [totalanswered] = await db.sequelize
                    .query(
                        `select COUNT(*) as totalattend,
                         sect_id from tbl__exam_result 
                         where taken_id = ? and exam_id = ? and attend_ans!=0 GROUP BY sect_id`,
                        { replacements: [taken_id, result.exam_id] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                const [totalseen] = await db.sequelize
                    .query(
                        `select COUNT(*) as totalattend,
                         sect_id from tbl__exam_result 
                         where taken_id = ? and exam_id = ?  GROUP BY sect_id`,
                        { replacements: [taken_id, result.exam_id] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });
                //  Total Correct Answer
                const [crtanswer] = await db.sequelize
                    .query(
                        `SELECT COUNT(*) AS crtansw, sect_id FROM tbl__exam_result WHERE taken_id = ?
                AND attend_ans!=0 AND attend_ans = crt_ans AND exam_id = ? group by sect_id`,
                        { replacements: [taken_id, result.exam_id] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                // 6. Send Respose
                if (!result) res.send({ status: false, message: "Exam Not Yet Completed !!!" });
                else {
                    let sectionResultSummary = [];
                    let totalQuestions = 0;
                    let totalMarks = 0;
                    let questionsSeen = 0;
                    let questionsAnswered = 0;
                    let questionsNotAnswered = 0;
                    let numberOfCorrectAns = 0;
                    let numberOfWrongAns = 0;
                    let marksForCorrectAns = 0;
                    let marksForWrongAns = 0;
                    let finalScore = 0;
                    for (let section of sectiondata) {
                        totalQuestions1 = section.no_ofquest;
                        totalMarks1 = section.tot_marks;
                        questionsSeen1 = totalanswered.find(e => e.sect_id == section.sect_id) != null ? totalanswered.find(e => e.sect_id == section.sect_id).totalattend : 0;
                        questionsAnswered1 = questionsSeen1;
                        questionsNotAnswered1 = (section.ques_ans > 0 ? section.ques_ans : section.no_ofquest) - questionsSeen1;
                        numberOfCorrectAns1 = crtanswer.find(e => e.sect_id == section.sect_id) != null ? crtanswer.find(e => e.sect_id == section.sect_id).crtansw : 0;
                        numberOfWrongAns1 = questionsSeen1 - numberOfCorrectAns1;
                        marksForCorrectAns1 = numberOfCorrectAns1 * section.mark_perquest;
                        marksForWrongAns1 = numberOfWrongAns1 * section.neg_mark;
                        finalScore1 = (marksForCorrectAns1) - (marksForWrongAns1);
                        
                        sectionResultSummary.push({
                            sectionName: section.menu_title,
                            totalQuestions: section.ques_ans > 0 ? section.ques_ans : section.no_ofquest,
                            totalMarks: (section.ques_ans > 0 ? section.ques_ans : section.no_ofquest) * section.mark_perquest,
                            questionsSeen: questionsSeen1,
                            questionsAnswered: questionsAnswered1,
                            questionsNotAnswered: questionsNotAnswered1,
                            numberOfCorrectAns: numberOfCorrectAns1,
                            numberOfWrongAns: numberOfWrongAns1,
                            marksForCorrectAns: marksForCorrectAns1,
                            marksForWrongAns: marksForWrongAns1,
                            finalScore: finalScore1,
                        })

                        totalQuestions += section.ques_ans > 0 ? section.ques_ans : section.no_ofquest;
                        totalMarks += (section.ques_ans > 0 ? section.ques_ans : section.no_ofquest) * section.mark_perquest;
                        questionsSeen += parseFloat(questionsSeen1);
                        questionsAnswered += parseFloat(questionsAnswered1);
                        questionsNotAnswered += parseFloat(questionsNotAnswered1);
                        numberOfCorrectAns += parseFloat(numberOfCorrectAns1);
                        numberOfWrongAns += parseFloat(numberOfWrongAns1);
                        marksForCorrectAns += parseFloat(marksForCorrectAns1);
                        marksForWrongAns += parseFloat(marksForWrongAns1);
                        finalScore += parseFloat(finalScore1);
                    }
                    sectionResultSummary.push({
                        sectionName: "Total",
                        totalQuestions,
                        totalMarks,
                        questionsSeen,
                        questionsAnswered,
                        questionsNotAnswered,
                        numberOfCorrectAns,
                        numberOfWrongAns,
                        marksForCorrectAns,
                        marksForWrongAns,
                        finalScore,
                    });
                    let emailData = {
                        totalQuestions,
                        totalMarks,
                        questionsSeen,
                        questionsAnswered,
                        questionsNotAnswered,
                        noOfCorrectAnswer: numberOfCorrectAns,
                        noOfWrongAnswer: numberOfWrongAns,
                        marksForCorrectAnswer: marksForCorrectAns,
                        marksForWrongAnswer: marksForWrongAns,
                        finalScore,
                    }
                    //  Email and SMS
                    let toEmailId = req.user.email;
                    let subject = "Scores Obtained";
                    let userName = req.user.name;
                    if (sendSms == 1) {
                        SendResultMail(toEmailId, subject, userName, emailData, title);
                        SendResultSms(req.user.mobile, req.user.name, emailData.finalScore, title);
                    }
                    res.send({ sectiondata, totalseen, totalanswered, totalRank: totalAttend, examName, examname: title, crtansw: crtanswer, takendetail: result, rank: rank + 1, sectionResultSummary });
                }
            }
        } catch (error) {
            logger.error(`Error at Get Result User : ${error.message}`);
            next(error);
        }
    },

    // 6. Get Exam Name User
    getExamName: async (req, res, next) => {
        try {
            let { exam_id } = req.params;
            if (!exam_id) throw createHttpError.BadRequest();
            let examTitle = "";

            // 1. Get Exam Details in Exam Table
            const examData = await db.Exams.findOne({ where: { exam_id, exam_status: "Y" } }).catch(
                (err) => {
                    throw createError.InternalServerError(err.message);
                }
            );

            if (examData) {
                // 2. Get Category Name, 3. Get Sub Category Name

                const [categoryName] = await db.sequelize
                    .query(
                        `SELECT a.exa_cat_name AS "subCategory",b.exa_cat_name AS "category",c.exa_cat_name AS "masterCategory" 
                        FROM tbl__exam_category AS a
                        INNER JOIN tbl__exam_category AS b ON a.exaid_sub=b.exa_cat_id
                        INNER JOIN tbl__exam_category AS c ON b.exaid=c.exa_cat_id
                        WHERE a.examcat_type='S' AND a.exa_cat_status='Y' AND b.exa_cat_status='Y'
                        AND c.exa_cat_status='Y' AND a.exa_cat_id=?`,
                        { replacements: [examData.exam_sub_sub] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                /*
                // 2. Get Category Name
                const categoryName = await db.ExamMainCategory.findOne({
                    where: { exa_cat_id: examData.exam_sub, exa_cat_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

                // 3. Get Sub Category Name
                const subCategoryName = await db.ExamMainCategory.findOne({
                    where: { exa_cat_id: examData.exam_sub_sub, exa_cat_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                */

                // 4. check topic wise test or else
                if (examData.exam_type_cat === "C") {
                    // 5. Chapter Name
                    const examChapter = await db.ExamChapters.findOne({
                        //where: { chapt_id: examData.exam_type_id, chapter_status: "Y" },
                        where: { chapt_id: examData.exam_type_id },
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    // Check ExamType, then send examTitle
                    if (examData.exam_type == "C")
                        examTitle = `${categoryName[0].category} - ${categoryName[0].subCategory} - Topic-wise Test - ${examChapter.chapter_name}`;
                    else
                        examTitle = `${categoryName[0].category} - ${categoryName[0].subCategory} - ${examChapter.chapter_name}`;
                } else if (examData.exam_type_cat === "T") {
                    // 6. Get Topic Name
                    const examType = await db.ExamTypes.findOne({
                        where: { extype_id: examData.exam_type_id, extype_status: "Y" },
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    // Check ExamType, then send examTitle
                    if (examData.exam_type == "C")
                        examTitle = `${categoryName[0].category} - ${categoryName[0].subCategory} - ${examType.extest_type}`;
                    else
                        examTitle = `${categoryName[0].category} - ${categoryName[0].subCategory} - ${examType.extest_type}`;
                }
                res.send({ examTitle, examName: examData.exam_name });
            } else {
                res.send({ status: 404, message: "Sorry, Exam Name Not Available." });
            }
        } catch (error) {
            logger.error(`Error at Get Exam Name User : ${error.message}`);
            next(error);
        }
    },

    // Get Date
    getDate: async (req, res, next) => {
        try {
            res.send({ timenow: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") });
        } catch (error) {
            next(error);
        }
    },

    // Get Sectionwise Result User
    getSectionResult: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();
            // 1. Exam taken record by taken_id
            const result = await db.Examtakenlist.findOne({
                where: {
                    taken_id: taken_id,
                    exam_status: "C",
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const [sectiondata] = await db.sequelize
                .query(
                    `SELECT * FROM tbl__exam_sectdetails WHERE exam_id = ? and no_ofquest > 0`,
                    { replacements: [result.exam_id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            const [totalattend] = await db.sequelize
                .query(
                    `select COUNT(*) as totalattend, sect_id from tbl__exam_result where taken_id = ? and exam_id = ? GROUP BY sect_id`,
                    { replacements: [taken_id, result.exam_id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            //  Total Correct Answer
            const [crtansw] = await db.sequelize
                .query(
                    `SELECT COUNT(*) AS crtansw, sect_id FROM tbl__exam_result WHERE taken_id = ?
                AND attend_ans!=0 AND attend_ans = crt_ans AND exam_id = ? group by sect_id`,
                    { replacements: [taken_id, result.exam_id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            // 6. Send Respose
            if (!result) res.send({ status: false, message: "Exam Not Yet Completed !!!" });
            else {
                /*let data = {
                    sectiondata
                };*/
                res.send({ sectiondata, totalattend, crtansw });
            }
        } catch (error) {
            logger.error(`Error at Get Result User : ${error.message}`);
            next(error);
        }
    },
    getExamById: async (req, res, next) => {
        try {
            let { id } = req.params;
            if (id == 0) throw createError.BadRequest();

            let Exam = await db.Exams.findOne({
                where: { exam_id: id },
            });
            let Section = await db.ExamSectionDetails.findAndCountAll({
                where: { exam_id: id },
            });

            if (!Exam) throw createError.NotFound("Exam Not Found !!!");
            res.send({ Exam, Section: Section.rows });
        } catch (error) {
            logger.error(`Error at Get Exam By Id : ${error.message}`);
            next(error);
        }
    },
    sendmessage: async (req, res, next) => {
        try {
            let { name, mobile, email, subject, message } = req.body;
            if (!name || !mobile || !email || !subject || !message)
                throw createHttpError.BadRequest();
            let sendermail = req.user.email;
            SendContactUsMail(sendermail, name, mobile, email, subject, message);
        } catch (error) {
            logger.error(`Error at Get Exam By Id : ${error.message}`);
            next(error);
        }
    }
};

function getExamTitle(exam_id) {
    return new Promise(async (resolve, reject) => {
        let examTitle = "";

        // Get Exam Details in Exam Table
        const { count, rows } = await db.Exams.findAndCountAll({
            where: {
                exam_id,
                exam_status: "Y",
            },
        }).catch((err) => {
            throw createError.InternalServerError(err.message);
        });

        if (count > 0) {
            const [category, metadata] = await db.sequelize
                .query(
                    `
                        SELECT a.exa_cat_name AS "subCategory",b.exa_cat_name AS "category",c.exa_cat_name AS "masterCategory" 
                        FROM tbl__exam_category AS a
                        INNER JOIN tbl__exam_category AS b ON a.exaid_sub=b.exa_cat_id
                        INNER JOIN tbl__exam_category AS c ON b.exaid=c.exa_cat_id
                        WHERE a.examcat_type='S' AND a.exa_cat_status='Y' AND b.exa_cat_status='Y'
                        AND c.exa_cat_status='Y' AND a.exa_cat_id=?
                    `,
                    { replacements: [rows[0].exam_sub_sub] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            // 4. check topic wise test or else
            if (rows[0].exam_type_cat === "C") {
                const examChapter = await db.ExamChapters.findOne({
                    where: { chapt_id: rows[0].exam_type_id, chapter_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                //examTitle = `${categoryName.exa_cat_name} - ${subCategoryName.exa_cat_name} - Topic Wise Test - ${examChapter.chapter_name}`;
                examTitle = `${category[0].category} >> ${category[0].subCategory} >> Topic-wise Test >> ${examChapter.chapter_name}`;
            } else if (rows[0].exam_type_cat === "T") {
                const examType = await db.ExamTypes.findOne({
                    where: { extype_id: rows[0].exam_type_id, extype_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                //examTitle = `${categoryName.exa_cat_name} - ${subCategoryName.exa_cat_name} - ${examType.extest_type}`;
                examTitle = `${category[0].category} >> ${category[0].subCategory} >> ${examType.extest_type}`;
            }
            resolve({
                examTitle,
                masterCategoryName: category[0].masterCategory,
                examname: rows[0].exam_name,
            });
        } else {
            reject("No Title Avail");
        }
    });
}