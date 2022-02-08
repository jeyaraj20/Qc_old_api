const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
// const SchoolExamsectdetailsModel = require("../Models/SchoolExamsectdetails.model");
const logger = require("../helper/schoolLogger");

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
    getAllSchoolExam: async (req, res, next) => {
        try {
            let { type, status, exa_cat_id, schoolid } = req.body;
            if (!type || !status || !exa_cat_id) throw createError.BadRequest();

            const { count, rows } = await db.SchoolExams.findAndCountAll({
                where: {
                    exam_type: type,
                    exam_status: status,
                    exam_sub_sub: exa_cat_id,
                    schoolid: req.user.id
                },
                order: [["exam_id"]],
            });

            if (!rows) {
                throw createError.NotFound("Exam Not Found !!!");
            }
            res.send({ count, Exam: rows });
        } catch (error) {
            logger.error(`Error at Get All Exam By Status - School : ${error.message}`);
            next(error);
        }
    },

    // 2. Get Exam By Id
    getSchoolExamById: async (req, res, next) => {
        try {
            let { id } = req.params;
            if (id == 0) throw createError.BadRequest();

            let Exam = await db.SchoolExams.findOne({
                include: [
                    {
                        model: db.SchoolExamSectionDetails,
                    },
                ],
                where: { exam_id: id, schoolid: req.user.id },
            });

            if (!Exam) throw createError.NotFound("Exam Not Found !!!");
            res.send({ Exam });
        } catch (error) {
            logger.error(`Error at Get Exam By Id - School : ${error.message}`);
            next(error);
        }
    },

    // 3. Create Common Exam
    createSchoolExam: async (req, res, next) => {
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
                ip_addr,
                payment_flag,
                selling_price,
                offer_price,
                startDate,
                endDate
            } = req.body;
            if (
                !exam_cat ||
                !exam_sub ||
                !exam_sub_sub ||
                !exam_name ||
                !assign_test_type ||
                !exam_type ||
                !exam_code ||
                !exam_level ||
                !tot_questions ||
                !tot_mark ||
                !mark_perquest ||
                !neg_markquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !ip_addr
            )
                throw createError.BadRequest();

            const [exam, created] = await db.SchoolExams.findOrCreate({
                where: { exam_code, schoolid: req.user.id },
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
                    schoolid: req.user.id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD"),
                    ip_addr,
                    last_update: moment(Date.now()).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),
                    payment_flag,
                    selling_price,
                    offer_price,
                    startDate,
                    endDate,
                    transaction: t,
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (!created) {
                throw createError.Conflict(
                    `${exam_code} - Exam Code Already Exists`
                );
            }
            res.send({ message: "Exam Created Success !!!" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Common Exam - School : ${error.message}`);
            next(error);
        }
    },

    // 4. Create Bank Exam
    createSchoolBankExam: async (req, res, next) => {
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
                ip_addr,
                sections,
                payment_flag,
                selling_price,
                offer_price,
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

            const [exam, created] = await db.SchoolExams.findOrCreate({
                where: { exam_code, schoolid: req.user.id },
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
                    schoolid: req.user.id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD"),
                    ip_addr,
                    last_update: moment(Date.now()).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),
                    payment_flag,
                    selling_price,
                    offer_price,
                    startDate,
                    endDate,
                    transaction: t,
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            if (created) {
                let examSectionsList = [];
                sections.forEach((list) => {
                    examSectionsList.push({
                        exam_id: exam.exam_id,
                        schoolid: req.user.id,
                        main_cat: "0",
                        sub_cat: "0",
                        menu_title: list.menu_title,
                        no_ofquest: list.no_ofquest,
                        mark_perquest: list.mark_perquest,
                        tot_marks: list.tot_marks,
                        neg_mark: list.neg_mark,
                        cut_off: list.cut_off,
                        sect_time: list.sect_time,
                        sect_date: moment(Date.now()).format("YYYY-MM-DD"),
                        lastupdate: moment(Date.now()).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    });
                });
                // 2. tbl__exam_sectdetails insert
                await db.SchoolExamSectionDetails.bulkCreate(examSectionsList, {
                    transaction: t,
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                res.send({ message: "Bank Exam Created Success !!!" });
            } else {
                throw createError.Conflict(
                    `${exam_code} - Exam Code Already Exists`
                );
            }

            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Create Bank Exam - School : ${error.message}`);
            next(error);
        }
    },

    // 5. Update Exam
    updateSchoolExamById: async (req, res, next) => {
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
                !neg_markquest ||
                !total_time ||
                !quest_type ||
                !exam_type_cat ||
                !exam_type_id ||
                !ip_addr
            )
                throw createError.BadRequest();

            await db.SchoolExams.update(
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
                    schoolid: req.user.id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD"),
                    ip_addr,
                    last_update: moment(Date.now()).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),
                    startDate,
                    endDate
                },
                { where: { exam_id: id, schoolid: req.user.id } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ message: "Exam Updated Success !!!" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Update Common Exam - School : ${error.message}`);
            next(error);
        }
    },

    // 6. Update Bank Exam
    updateSchoolBankExamById: async (req, res, next) => {
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
                schoolid,
                exam_pos,
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

            await db.SchoolExams.update(
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
                    schoolid: req.user.id,
                    exam_pos,
                    exam_status: "W",
                    exam_add_type: "S",
                    exam_add_id: req.user.id,
                    exam_add_name: req.user.username,
                    exam_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    ip_addr,
                    last_update: moment(Date.now()).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),
                    startDate,
                    endDate
                },
                { where: { exam_id: id, schoolid: req.user.id } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            // 2. tbl__exam_sectdetails delete
            await db.SchoolExamSectionDetails.update(
                { exam_id: "0" },
                { where: { exam_id: id, schoolid: req.user.id } },
                { transaction: t }
            ).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            let examSectionsList = [];
            sections.forEach((list) => {
                examSectionsList.push({
                    exam_id: id,
                    schoolid: req.user.id,
                    main_cat: "0",
                    sub_cat: "0",
                    menu_title: list.menu_title,
                    no_ofquest: list.no_ofquest,
                    mark_perquest: list.mark_perquest,
                    tot_marks: list.tot_marks,
                    neg_mark: list.neg_mark,
                    cut_off: list.cut_off,
                    sect_time: list.sect_time,
                    sect_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    lastupdate: moment(Date.now()).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),
                });
            });
            // 3. tbl__exam_sectdetails insert
            await db.SchoolExamSectionDetails.bulkCreate(examSectionsList, {
                transaction: t,
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            res.send({ message: "Exam Updated Success !!!" });
            await t.commit();
        } catch (error) {
            await t.rollback();
            logger.error(`Error at Update Bank Exam - School : ${error.message}`);
            next(error);
        }
    },

    // 7. Update Exam Status 'Inactive / Active / Delete'
    updateSchoolStatusById: async (req, res, next) => {
        try {
            let { exam_id, status } = req.body;
            if (!exam_id || !status) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                await db.SchoolExams.update(
                    { exam_status: status },
                    { where: { exam_id: exam_id, schoolid: req.user.id } },
                    { transaction: t }
                ).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                res.send({ message: "Updated Success" });
            });
        } catch (error) {
            logger.error(`Error at Update Exam Status - School : ${error.message}`);
            next(error);
        }
    },

    getSchoolPreviousYear: async (req, res, next) => {
        try {
            let { exam_cat, exam_sub } = req.body;
            if (!exam_cat || !exam_sub) throw createError.BadRequest();

            const { count, rows } = await db.SchoolExams.findAndCountAll({
                where: {
                    schoolid: req.user.id,
                    exam_type: 'C',
                    exam_cat: exam_cat,
                    exam_sub: exam_sub,
                    exam_status: 'Y'
                },
                order: [["exam_id"]],
            });
            if (!rows)
                throw createError.NotFound("Previous year question Not Found !!!");
            res.send({ count, Exam: rows });
        } catch (error) {
            logger.error(`Error at Get Previous Year - School : ${error.message}`);
            next(error);
        }
    },
    getSchoolTestTypes: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__schoolexamtypes where extype_id not in (
                    select exam_type_id from tbl__schoolexam 
                     where exam_type_cat='T' AND schoolid=${req.user.id}   AND assign_test_type ='D' AND exam_status !='D'
                     and exam_sub_sub=?)
                     and exa_cat_id=? and extype_status='Y' order by extype_id asc
            `,
                { replacements: [sub_cat_id, sub_cat_id] }
            );

            if (!category)
                throw createError.NotFound("Test types Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at School Test Types - School : ${error.message}`);
            next(error);
        }
    },

    getSchoolChapters: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__schoolexamchapters where chapt_id 
                not in (
                select exam_type_id from tbl__schoolexam 
                 where exam_type_cat='C'AND schoolid=${req.user.id}   AND assign_test_type ='D' AND exam_status !='D'
                 and exam_sub_sub=?)
                 and exa_cat_id=? and chapter_status='Y' order by chapt_id asc
            `,
                { replacements: [sub_cat_id, sub_cat_id] }
            );

            if (!category)
                throw createError.NotFound("chapters list Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at School Chapters - School : ${error.message}`);
            next(error);
        }
    },
    getSchoolTestTypesEdit: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__schoolexamtypes where 
                      exa_cat_id=? and extype_status='Y' and schoolid=${req.user.id}  order by extype_id asc
            `,
                { replacements: [sub_cat_id] }
            );

            if (!category)
                throw createError.NotFound("Test types Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at School Test Types Edit - School : ${error.message}`);
            next(error);
        }
    },

    getSchoolChaptersEdit: async (req, res, next) => {
        try {
            let { sub_cat_id } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `select * from tbl__schoolexamchapters where 
                exa_cat_id=? and chapter_status='Y' and schoolid=${req.user.id}  order by chapt_id asc
            `,
                { replacements: [sub_cat_id] }
            );

            if (!category)
                throw createError.NotFound("chapters list Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at School Chapter Edit - School : ${error.message}`);
            next(error);
        }
    },

    getSchoolSection: async (req, res, next) => {
        try {
            let { exam_id } = req.params;
            if (exam_id == 0 || !exam_id) throw createError.BadRequest();

            const { count, rows } = await db.SchoolExamSectionDetails.findAndCountAll({
                where: {
                    exam_id: exam_id,
                    schoolid: req.user.id
                },
                order: [["sect_id"]],
            });

            if (!rows) {
                throw createError.NotFound("Exam Section Not Found !!!");
            }
            res.send({ count, Section: rows });
        } catch (error) {
            logger.error(`Error at Get School Section - School : ${error.message}`);
            next(error);
        }
    },

    getAllExamWithAssignedcount: async (req, res, next) => {
        try {
            let { type, status, exa_cat_id } = req.body;
            if (!type || !status || !exa_cat_id) throw createError.BadRequest();
            const [Exam] = await db.sequelize.query(`
           SELECT a.*,
           COUNT(b.exam_id) as totalassigned FROM tbl__schoolexam AS a 
           left join tbl__schoolexamquestions as b on a.exam_id=b.exam_id and b.exam_queststatus='Y'
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

            count = await db.SchoolExams.count({
                where: { exam_type: type, exam_status: status, exam_sub_sub: exa_cat_id },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get All Exam By Status : ${error.message}`);
            next(error);
        }
    },


    getExamResutlReport: async (req, res, next) => {
        try {
            let { schoolId } = req.params;
            if (!schoolId) throw createHttpError.BadRequest();
            const result = await db.sequelize.query(
                    `SELECT 
                        tbl__schoolexamtaken_list.post_mark as post_mark,
                        tbl__schoolexamtaken_list.tot_quest as tot_quest,
                        tbl__schoolexamtaken_list.tot_attend as tot_attend,
                        tbl__schoolexamtaken_list.not_answered as not_answered,
                        tbl__schoolexamtaken_list.answ_crt as answ_crt,
                        tbl__schoolexamtaken_list.answ_wrong as answ_wrong,
                        tbl__schoolexamtaken_list.tot_postimark as tot_postimark,
                        tbl__schoolexamtaken_list.tot_negmarks as tot_negmarks,
                        tbl__schoolexamtaken_list.total_mark as total_mark,
                        tbl__schoolexamtaken_list.start_time as start_time,
                        tbl__schoolexamtaken_list.end_time as end_time,
                        tbl__schoolexamtaken_list.exam_status,
                        tbl__school_student.stud_fname,
                        tbl__school_student.stud_lname,
                        tbl__school_student.stud_dob,
                        tbl__school_student.stud_regno,
                        tbl__school_student.stud_email,
                        tbl__school_student.stud_mobile,
                        tbl__school_exam_categoryMain.exa_cat_name as mainCategory,
                        tbl__school_exam_category.exa_cat_name as subCategory,
                        tbl__schoolexamchapters.chapter_name,
                        tbl__schoolexam.exam_name
                    FROM 
                        tbl__schoolexamtaken_list
                        INNER JOIN tbl__school ON tbl__school.id = tbl__schoolexamtaken_list.school_id
                        INNER JOIN tbl__school_student ON tbl__school_student.stud_id = tbl__schoolexamtaken_list.stud_id
                        INNER JOIN tbl__schoolexam ON tbl__schoolexam.exam_id = tbl__schoolexamtaken_list.exam_id
                        INNER JOIN tbl__schoolexamchapters ON tbl__schoolexamchapters.exa_cat_id = tbl__schoolexam.exam_sub_sub
                        INNER JOIN tbl__school_exam_category ON tbl__school_exam_category.exa_cat_id = tbl__schoolexam.exam_sub
                        INNER JOIN tbl__school_exam_category AS tbl__school_exam_categoryMain ON tbl__school_exam_categoryMain.exa_cat_id = tbl__schoolexam.exam_cat
                    WHERE 
                        tbl__schoolexamtaken_list.school_id = ${schoolId} AND tbl__schoolexamtaken_list.exam_status='C'`
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({  res : result[0] });
        } catch (error) {
            logger.error(`Error at Get Result User : ${error.message}`);
            next(error);
        }
    },
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
                        tbl__schoolexam AS E
                        INNER JOIN tbl__school_exam_category AS MC ON MC.exa_cat_id=E.exam_cat
                        INNER JOIN tbl__school_exam_category AS C ON C.exa_cat_id=E.exam_sub
                        INNER JOIN tbl__school_exam_category AS CS ON CS.exa_cat_id=E.exam_sub_sub
                        LEFT JOIN tbl__schoolexamchapters AS CT ON CT.chapt_id=E.exam_type_id AND E.exam_type_cat="C"
                        LEFT JOIN tbl__schoolexamtypes AS TY ON TY.extype_id=E.exam_type_id AND E.exam_type_cat="T"
                        INNER JOIN tbl__schoolexamquestions AS EQ ON EQ.exam_id=E.exam_id AND exam_queststatus="Y"
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
                    headerName: req.user.schoolname,
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
                    headerName: req.user.schoolname,
                    rowCount: questions.length,
                    isShowCrtAns: isShowCrtAns && (isShowCrtAns === 'true' || isShowCrtAns === true) ? true : false
                });
            }

            // const browser = await puppeteer.launch();
            const browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium-browser',
                args: ['--no-sandbox', '--disable-dev-shm-usage'],
            });
            const page = await browser.newPage();
            await page.setContent(html);
            await page.pdf({ path: path.resolve(templatesPath, `examQuestion.pdf`), format: 'A4' });
            await browser.close();
            console.log("PDF Generated");
            await path.resolve(templatesPath, `examQuestion.pdf`);
            fs.readFile(path.join(templatesPath, 'examQuestion.pdf'), function (err, data2) {
                res.header('Content-Type', 'application/pdf');
                res.header('Content-Transfer-Encoding', 'Binary');
                res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
                res.send(data2);
            });
        } catch (error) {
            logger.error(`Error at Get Exam By Id : ${error.message}`);
            next(error);
        }
    },
};
