const db = require("../../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../../helper/userLogger");
const { SendResultMail, SendResultSms } = require("../../helper/general_helper");

module.exports = {
    // 1. Set Exam Taken School
    setExamTaken: async (req, res, next) => {
        try {
            let { exam_id, ip_addr } = req.body;
            if (!exam_id || !ip_addr) throw createHttpError.BadRequest();
            const { count, rows } = await db.SchoolExams.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    exam_status: "Y",
                    schoolid: req.user.schoolId
                },
            });

            if (count > 0) {
                console.log(rows[0]);
                await db.SchoolExamtakenlist.create({
                    stud_id: req.user.id,
                    school_id: req.user.schoolId,
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

    // Get Exam Taken
    getExamTaken: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();

            const [examtaken] = await db.sequelize.query(
                `select * from tbl__schoolexamtaken_list as a 
                    inner join tbl__schoolexam as b on a.exam_id=b.exam_id
                    left join tbl__schoolexamchapters as c on b.exam_type_id=c.chapt_id
                    left join tbl__schoolexamtypes as d on b.exam_type_id=d.extype_id
                    where a.taken_id=? and a.exam_status='S' 
                    and a.stud_id=? and a.school_id=?`  ,
                { replacements: [taken_id, req.user.id, req.user.schoolId] }
            );
            const [examquestion] = await db.sequelize.query(
                `select a.exq_id,a.exam_id,a.sect_id,a.qid,a.q_type,a.question,a.quest_desc,a.opt_type1,a.opt_type2,a.opt_type3,a.opt_type4,a.opt_type5,
                a.opt_1,a.opt_2,a.opt_3,a.opt_4,a.opt_5
                ,b.attend_ans,b.review_val from tbl__schoolexamquestions as a 
                left join tbl__schoolexam_result as b on a.exq_id=b.quest_id and b.exam_id=?
                and b.taken_id=?
                where a.exam_id=?  and a.exam_queststatus='Y'
                and a.schoolid=?
                order by a.sect_id,a.exq_id;`,
                {
                    replacements: [examtaken[0].exam_id, taken_id,
                    examtaken[0].exam_id, req.user.schoolId]
                }
            );

            let section = await db.SchoolExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: examtaken[0].exam_id,
                    schoolid: req.user.schoolId,
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

    // Get Exam Complete School
    getExamComplete: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();

            const [examtaken] = await db.sequelize.query(
                `select * from tbl__schoolexamtaken_list as a 
                    inner join tbl__schoolexam as b on a.exam_id=b.exam_id
                    left join tbl__schoolexamchapters as c on b.exam_type_id=c.chapt_id
                    left join tbl__schoolexamtypes as d on b.exam_type_id=d.extype_id
                    where a.taken_id=? and a.exam_status='C' 
                    and a.stud_id=? and a.school_id`,
                { replacements: [taken_id, req.user.id, req.user.schoolId] }
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

    // Get Exam Taken Answer School
    getExamTakenAnswer: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();

            const [examtaken] = await db.sequelize.query(
                `select * from tbl__schoolexamtaken_list as a 
                    inner join tbl__schoolexam as b on a.exam_id=b.exam_id
                    left join tbl__schoolexamchapters as c on b.exam_type_id=c.chapt_id
                    left join tbl__schoolexamtypes as d on b.exam_type_id=d.extype_id
                    where a.taken_id=? and a.exam_status='C' and a.stud_id=?
                    and a.school_id`
                ,
                { replacements: [taken_id, req.user.id, req.user.schoolId] }
            );
            if (!examtaken) {
                throw createError.NotFound("exam taken not Found !!!");
            }

            const [examquestion] = await db.sequelize.query(
                `select a.exq_id,a.exam_id,a.sect_id,a.qid,a.q_type,a.question,
                a.quest_desc,a.opt_type1,a.opt_type2,a.opt_type3,a.opt_type4,a.opt_type5,
                a.opt_1,a.opt_2,a.opt_3,a.opt_4,a.opt_5,a.crt_ans
                ,b.attend_ans,b.review_val from tbl__schoolexamquestions as a 
                left join tbl__schoolexam_result as b on a.exq_id=b.quest_id and b.exam_id=?
                and b.taken_id=?
                where a.exam_id=?  and a.exam_queststatus='Y' and a.schoolid=?
                group by a.exq_id
                order by a.sect_id,a.exq_id;`,
                {
                    replacements: [examtaken[0].exam_id, taken_id,
                    examtaken[0].exam_id, req.user.schoolId]
                }
            );

            let section = await db.SchoolExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: examtaken[0].exam_id,
                    schoolid: req.user.schoolId
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

    // Set Exam Result
    setExamResult: async (req, res, next) => {
        try {
            let { exq_id, exam_id, taken_id, ansval, reveval, ipaddress, sect_id } = req.body;
            //if (!exq_id || !exam_id || !taken_id || !ansval || !reveval || !ipaddress)
            //  throw createHttpError.BadRequest();

            const { rows } = await db.SchoolExamQuestions.findAndCountAll({
                where: {
                    exq_id: exq_id,
                    exam_queststatus: "Y",
                    schoolid: req.user.schoolId
                },
                order: [["exam_id"]],
            });

            const examdata = await db.SchoolExams.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    exam_status: "Y",
                    schoolid: req.user.schoolId
                },
                order: [["exam_id"]],
            });

            const sectiondata = await db.SchoolExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    sect_id: sect_id,
                    schoolid: req.user.schoolId
                },
            });

            const examresultdata = await db.SchoolExamresult.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    stud_id: req.user.id,
                    taken_id: taken_id,
                    quest_id: exq_id,
                    school_id: req.user.schoolId
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
                console.log(req.user);
                await db.SchoolExamresult.create({
                    school_id: req.user.schoolId,
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

                await db.SchoolExamresult.update(
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

    // Save Exam Result School
    saveExamResult: async (req, res, next) => {
        try {
            let { exq_id, exam_id, taken_id, ansval, reveval, ipaddress, sect_id } = req.body;
            if (!exq_id || !exam_id || !taken_id || !reveval || !ipaddress)
                throw createHttpError.BadRequest();

            const { rows } = await db.SchoolExamQuestions.findAndCountAll({
                where: {
                    exq_id: exq_id,
                    exam_queststatus: "Y",
                    schoolid: req.user.schoolId
                },
                order: [["exam_id"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const sectiondata = await db.SchoolExamSectionDetails.findAndCountAll({
                where: {
                    exam_id, sect_id,
                    schoolid: req.user.schoolId
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const examdata = await db.SchoolExams.findAndCountAll({
                where: {
                    exam_id,
                    exam_status: "Y",
                    schoolid: req.user.schoolId
                },
                order: [["exam_id"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const examresultdata = await db.SchoolExamresult.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    stud_id: req.user.id,
                    taken_id: taken_id,
                    quest_id: exq_id,
                    school_id: req.user.schoolId
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

            if (ansval != 0) {
                if (examresultdata.rows.length == 0) {
                    await db.SchoolExamresult.create({
                        school_id: req.user.schoolId,
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
                    await db.SchoolExamresult.update(
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
            }

            // Total attend
            const totalAttend = await db.SchoolExamresult.count({ where: { taken_id } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            const totalAttendwithanswer = await db.SchoolExamresult.count({ where: { taken_id, attend_ans: { [Op.ne]: 0 } } }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            console.log("totalAttend ==> data", totalAttend);
            let totattend = totalAttend;
            let totalttendwithanswer = totalAttendwithanswer;
            let totnotattend = tot_question - totattend;

            //  Total Correct Answer
            const crtansw = await db.sequelize
                .query(
                    `SELECT COUNT(*) AS crtansw FROM tbl__schoolexam_result WHERE taken_id = ?
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
                    `SELECT COUNT(*) AS wrongansw FROM tbl__schoolexam_result WHERE taken_id = ?
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
            await db.SchoolExamtakenlist.update(
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

        } catch (error) {
            logger.error(`Error at Save User Result User : ${error.message}`);
            next(error);
        }
    },

    // Get Result

    getResult: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();
            // 1. Exam taken record by taken_id
            const result = await db.SchoolExamtakenlist.findOne({
                where: {
                    taken_id: taken_id,
                    exam_status: "C",
                    school_id: req.user.schoolId
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            // 2. Cal total marks
            let totalMarks = result.tot_quest * result.post_mark;
            // 3. Get Rank for this totalMarks
            const rank = await db.SchoolExamtakenlist.count({
                where: {
                    exam_id: result.exam_id,
                    exam_status: "C",
                    total_mark: { [Op.gt]: result.total_mark },
                    taken_id: { [Op.ne]: taken_id },
                    school_id: req.user.schoolId
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            // 4. Total Attended Students
            const totalAttend = await db.SchoolExamtakenlist.count({
                where: {
                    exam_id: result.exam_id,
                    exam_status: "C",
                    school_id: req.user.schoolId
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            // 5. Get Exam name
            const examName = await db.SchoolExams.findOne({
                where: {
                    exam_id: result.exam_id,
                    schoolid: req.user.schoolId
                },
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

            let title = masterCategoryName + ' -> ' + examTitle + ' -> ' + examname;

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
                    SendResultMail(toEmailId, subject, userName, data, title);
                    SendResultSms(req.user.mobile, req.user.name, data.finalScore, title);
                    res.send({ ...data, takendetail: result });
                }
            } else {
                const [sectiondata] = await db.sequelize
                    .query(
                        `SELECT * FROM tbl__schoolexam_sectdetails WHERE exam_id = ? and no_ofquest > 0`,
                        { replacements: [result.exam_id] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                const [totalanswered] = await db.sequelize
                    .query(
                        `select COUNT(*) as totalattend, sect_id from tbl__schoolexam_result where taken_id = ? and attend_ans!=0 and exam_id = ? GROUP BY sect_id`,
                        { replacements: [taken_id, result.exam_id] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                const [totalseen] = await db.sequelize
                    .query(
                        `select COUNT(*) as totalattend, sect_id from tbl__schoolexam_result where taken_id = ? and exam_id = ? GROUP BY sect_id`,
                        { replacements: [taken_id, result.exam_id] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                //  Total Correct Answer
                const [crtanswer] = await db.sequelize
                    .query(
                        `SELECT COUNT(*) AS crtansw, sect_id FROM tbl__schoolexam_result WHERE taken_id = ?
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
                        questionsNotAnswered1 = section.no_ofquest - questionsSeen1;
                        numberOfCorrectAns1 = crtanswer.find(e => e.sect_id == section.sect_id) != null ? crtanswer.find(e => e.sect_id == section.sect_id).crtansw : 0;
                        numberOfWrongAns1 = questionsSeen1 - numberOfCorrectAns1;
                        marksForCorrectAns1 = numberOfCorrectAns1 * section.mark_perquest;
                        marksForWrongAns1 = numberOfWrongAns1 * section.neg_mark;
                        finalScore1 = (marksForCorrectAns1) - (marksForWrongAns1);

                        sectionResultSummary.push({
                            sectionName: section.menu_title,
                            totalQuestions: section.no_ofquest,
                            totalMarks: section.tot_marks,
                            questionsSeen: questionsSeen1,
                            questionsAnswered: questionsAnswered1,
                            questionsNotAnswered: questionsNotAnswered1,
                            numberOfCorrectAns: numberOfCorrectAns1,
                            numberOfWrongAns: numberOfWrongAns1,
                            marksForCorrectAns: marksForCorrectAns1,
                            marksForWrongAns: marksForWrongAns1,
                            finalScore: finalScore1,
                        })

                        totalQuestions += section.no_ofquest;
                        totalMarks += section.tot_marks;
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
                    SendResultMail(toEmailId, subject, userName, emailData, examName.exam_name);
                    SendResultSms(req.user.mobile, req.user.name, emailData.finalScore, examName.exam_name);
                    res.send({ sectiondata, totalseen, totalanswered, totalRank: totalAttend, examName, crtansw: crtanswer, takendetail: result, rank: rank + 1, sectionResultSummary });
                }
            }
        } catch (error) {
            logger.error(`Error at Get Result User : ${error.message}`);
            next(error);
        }
    },

    // 6. Get Exam Name School
    getExamName: async (req, res, next) => {
        try {
            let { exam_id } = req.params;
            if (!exam_id) throw createHttpError.BadRequest();
            let examTitle = "";

            // 1. Get Exam Details in Exam Table
            const examData = await db.SchoolExams.findOne(
                {
                    where:
                    {
                        exam_id,
                        exam_status: "Y",
                        schoolid: req.user.schoolId
                    },
                }).catch(
                    (err) => {
                        throw createError.InternalServerError(err.message);
                    }
                );

            if (examData) {
                // 2. Get Category Name, 3. Get Sub Category Name

                const [categoryName] = await db.sequelize
                    .query(
                        `SELECT a.exa_cat_name AS "subCategory",b.exa_cat_name AS "category",c.exa_cat_name AS "masterCategory" 
                        FROM tbl__school_exam_category AS a
                        INNER JOIN tbl__school_exam_category AS b ON a.exaid_sub=b.exa_cat_id
                        INNER JOIN tbl__school_exam_category AS c ON b.exaid=c.exa_cat_id
                        WHERE a.examcat_type='S' AND a.exa_cat_status='Y'
                         AND b.exa_cat_status='Y'
                        AND c.exa_cat_status='Y' AND a.exa_cat_id=? and a.schoolid=?`,
                        { replacements: [examData.exam_sub_sub, req.user.schoolId] }
                    )
                    .catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                if (examData.exam_type_cat === "C") {
                    // 5. Chapter Name
                    const examChapter = await db.SchoolExamChapters.findOne({
                        //where: { chapt_id: examData.exam_type_id, chapter_status: "Y" },
                        where: {
                            chapt_id: examData.exam_type_id,
                            schoolid: req.user.schoolId
                        },
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    // Check ExamType, then send examTitle
                    if (examData.exam_type == "C")
                        examTitle = `${categoryName[0].category} >> ${categoryName[0].subCategory} >> Topic Wise Test >> ${examChapter.chapter_name}`;
                    else
                        examTitle = `${categoryName[0].category} >> ${categoryName[0].subCategory} >> ${examChapter.chapter_name}`;
                } else if (examData.exam_type_cat === "T") {
                    // 6. Get Topic Name
                    const examType = await db.SchoolExamTypes.findOne({
                        where: {
                            extype_id: examData.exam_type_id,
                            extype_status: "Y",
                            schoolid: req.user.schoolId
                        },
                    }).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    // Check ExamType, then send examTitle
                    if (examData.exam_type == "C")
                        examTitle = `${categoryName[0].category} >> ${categoryName[0].subCategory} >> ${examType.extest_type}`;
                    else
                        examTitle = `${categoryName[0].category} >> ${categoryName[0].subCategory} >> ${examType.extest_type}`;
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

    getDate: async (req, res, next) => {
        try {
            res.send({ timenow: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") });
        } catch (error) {
            next(error);
        }
    },
    getSectionResult: async (req, res, next) => {
        try {
            let { taken_id } = req.params;
            if (!taken_id) throw createHttpError.BadRequest();
            // 1. Exam taken record by taken_id
            const result = await db.SchoolExamtakenlist.findOne({
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
                    `select COUNT(*) as totalattend, sect_id from tbl__schoolexam_result where taken_id = ? and attend_ans!=0 and exam_id = ? GROUP BY sect_id`,
                    { replacements: [taken_id, result.exam_id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            //  Total Correct Answer
            const [crtansw] = await db.sequelize
                .query(
                    `SELECT COUNT(*) AS crtansw, sect_id FROM tbl__schoolexam_result WHERE taken_id = ?
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

            let Exam = await db.SchoolExams.findOne({
                where: {
                    exam_id: id,
                    schoolid: req.user.schoolId
                },
            });

            let Section = await db.SchoolExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: id,
                    schoolid: req.user.schoolId
                },
            });

            if (!Exam) throw createError.NotFound("Exam Not Found !!!");
            res.send({ Exam, Section: Section.rows });

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
        const { count, rows } = await db.SchoolExams.findAndCountAll({
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
                        FROM tbl__school_exam_category AS a
                        INNER JOIN tbl__school_exam_category AS b ON a.exaid_sub=b.exa_cat_id
                        INNER JOIN tbl__school_exam_category AS c ON b.exaid=c.exa_cat_id
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
                const examChapter = await db.SchoolExamChapters.findOne({
                    where: { chapt_id: rows[0].exam_type_id, chapter_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                //examTitle = `${categoryName.exa_cat_name} - ${subCategoryName.exa_cat_name} - Topic Wise Test - ${examChapter.chapter_name}`;
                examTitle = `${category[0].category} - ${category[0].subCategory} - Topic Wise Test - ${examChapter.chapter_name}`;
            } else if (rows[0].exam_type_cat === "T") {
                const examType = await db.SchoolExamTypes.findOne({
                    where: { extype_id: rows[0].exam_type_id, extype_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                //examTitle = `${categoryName.exa_cat_name} - ${subCategoryName.exa_cat_name} - ${examType.extest_type}`;
                examTitle = `${category[0].category} - ${category[0].subCategory} - ${examType.extest_type}`;
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
