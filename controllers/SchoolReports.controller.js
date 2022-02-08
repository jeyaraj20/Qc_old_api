const db = require("../Models");
const createError = require("http-errors");
const _ = require('underscore');
const path = require("path");
const XLSX = require("xlsx");
var fs = require("fs");
require("dotenv").config();

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function getExamTitle(exam_id) {
    return new Promise(async (resolve, reject) => {
        let examTitle = "";
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
            if (rows[0].exam_type_cat === "C") {
                const examChapter = await db.ExamChapters.findOne({
                    where: { chapt_id: rows[0].exam_type_id, chapter_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                examTitle = `${category[0].category} - ${category[0].subCategory} - Topic Wise Test - ${examChapter.chapter_name}`;
            } else if (rows[0].exam_type_cat === "T") {
                const examType = await db.ExamTypes.findOne({
                    where: { extype_id: rows[0].exam_type_id, extype_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                examTitle = `${category[0].category} - ${category[0].subCategory} - ${examType.extest_type}`;
            }
            resolve({
                examTitle,
                masterCategoryName: category[0].masterCategory,
                examName: rows[0].exam_name,
            });
        } else {
            resolve("No Title Avail");
        }
    });
}

module.exports = {
    // 1. Get Overall Reports.
    getReports: async (req, res, next) => {
        try {
            const {
                period,
                startdate,
                enddate
            } = req.body;
            //if (!period) throw BadRequest();

            let [data] = await db.sequelize.query(
                `select cat2.cat_id, cat1.cat_name as maincategory, cat2.cat_name as subcategory, cat2.cat_code as subcategorycode
                     from tbl__school_question_category as cat1 join tbl__school_question_category as cat2 on cat2.pid = cat1.cat_id
                    where cat1.cat_status = 'Y' and cat2.cat_status = 'Y'
                     `
            ); // remove limit 10

            let [uploaded] = await db.sequelize.query(
                `select count(*) as uploaded, que.sub_id from tbl__schoolquestion as que where que.quest_status <> 'D' and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `' GROUP BY que.sub_id`
            );
            let [waiting] = await db.sequelize.query(
                `select count(*) as waiting, que.sub_id from tbl__schoolquestion as que where que.quest_status = 'W' and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'  GROUP BY que.sub_id`
            );
            let [active] = await db.sequelize.query(
                `select count(*) as active, que.sub_id from tbl__schoolquestion as que where que.quest_status = 'Y' and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'  GROUP BY que.sub_id`
            );
            let [inactive] = await db.sequelize.query(
                `select count(*) as inactive, que.sub_id from tbl__schoolquestion as que where que.quest_status = 'N' and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'  GROUP BY que.sub_id`
            );

            let finalArr = [];
            for (let category of data) {
                let uploadedArr = uploaded.filter(e => e.sub_id == category.cat_id)
                let waitingArr = waiting.filter(e => e.sub_id == category.cat_id)
                let activeArr = active.filter(e => e.sub_id == category.cat_id)
                let inactiveArr = inactive.filter(e => e.sub_id == category.cat_id)

                let uploadedCount;
                let waitingCount;
                let activeCount;
                let inactiveCount;

                if (uploadedArr.length != 0) {
                    uploadedCount = uploadedArr[0].uploaded
                } else {
                    uploadedCount = 0;
                }
                if (waitingArr.length != 0) {
                    waitingCount = waitingArr[0].waiting
                } else {
                    waitingCount = 0;
                }
                if (activeArr.length != 0) {
                    activeCount = activeArr[0].active
                } else {
                    activeCount = 0;
                }
                if (inactiveArr.length != 0) {
                    inactiveCount = inactiveArr[0].inactive
                } else {
                    inactiveCount = 0;
                }

                finalArr.push({
                    maincategory: category.maincategory,
                    subcategory: category.subcategory,
                    subcategorycode: category.subcategorycode,
                    uploaded: uploadedCount,
                    waiting: waitingCount,
                    active: activeCount,
                    inactive: inactiveCount
                });
            }

            //console.log(data);
            //let { processeddata } = await getOverallData(data, startdate, enddate);
            //console.log(processeddata);
            res.send({
                count: data.length,
                qdata: finalArr
            });
            //}
        } catch (error) {
            next(error);
        }
    },
    getMainReports: async (req, res, next) => {
        try {
            const {
                period,
                startdate,
                enddate
            } = req.body;

            let [categories] = await db.sequelize.query(
                `SELECT cat_id, cat_name from tbl__school_question_category where pid = 0 and cat_status !='D'
                     `
            );
            let [waiting] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as waiting from tbl__schoolquestion as a 
                INNER JOIN tbl__school_question_category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'W' and 
                a.quest_date BETWEEN '${startdate}' AND '${enddate}' GROUP BY b.cat_id
                     `
            );

            let [active] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as active from tbl__schoolquestion as a 
                INNER JOIN tbl__school_question_category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'Y' and 
                a.quest_date BETWEEN '${startdate}' AND '${enddate}' GROUP BY b.cat_id
                     `
            );

            let [inactive] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as inactive from tbl__schoolquestion as a 
                INNER JOIN tbl__school_question_category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'N' and 
                a.quest_date BETWEEN '${startdate}' AND '${enddate}' GROUP BY b.cat_id
                     `
            );

            let [totalquestion] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as total from tbl__schoolquestion as a 
                INNER JOIN tbl__school_question_category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status != 'D' and 
                a.quest_date BETWEEN '${startdate}' AND '${enddate}' GROUP BY b.cat_id
                     `
            );

            let finalArr = [];
            for (let category of categories) {
                let waitingArr = waiting.filter(e => e.cat_id == category.cat_id)
                let activeArr = active.filter(e => e.cat_id == category.cat_id)
                let inactiveArr = inactive.filter(e => e.cat_id == category.cat_id)
                let totalArr = totalquestion.filter(e => e.cat_id == category.cat_id)

                let waitingCount;
                let activeCount;
                let inactiveCount;
                let totalCount;
                if (waitingArr.length != 0) {
                    waitingCount = waitingArr[0].waiting
                } else {
                    waitingCount = 0;
                }
                if (activeArr.length != 0) {
                    activeCount = activeArr[0].active
                } else {
                    activeCount = 0;
                }
                if (inactiveArr.length != 0) {
                    inactiveCount = inactiveArr[0].inactive
                } else {
                    inactiveCount = 0;
                }
                if (totalArr.length != 0) {
                    totalCount = totalArr[0].total
                } else {
                    totalCount = 0;
                }
                //console.log(waitingCount);
                finalArr.push({
                    categoryname: category.cat_name,
                    waiting: waitingCount,
                    active: activeCount,
                    inactive: inactiveCount,
                    total: totalCount
                })
            }
            //console.log(finalArr);

            res.send({
                data: finalArr
            });

        } catch (error) {
            next(error);
        }
    },
    getTestReports: async (req, res, next) => {
        try {
            const {
                period,
                startdate,
                enddate
            } = req.body;

            let [data] = await db.sequelize.query(
                `select ec3.exa_cat_name as mastercategory, ec2.exa_cat_name as maincategory, ec1.exa_cat_name as subcategory,
                exam.exam_name as examname, exam.exam_code as examcode, exam.tot_questions as examques, exam.exam_add_name as staffname, exam.exam_date as examdate,
                exam.exam_type_cat as examcat ,exam.exam_type_id as examptype
                from tbl__schoolexam as exam,
                tbl__school_exam_category as ec1
                join tbl__school_exam_category as ec2 on ec1.exaid_sub = ec2.exa_cat_id
                join tbl__school_exam_category as ec3 on ec1.exaid = ec3.exa_cat_id 
                where exam.exam_status <> 'D' AND
                exam.exam_sub_sub = ec1.exa_cat_id AND
                exam.exam_date between '` + startdate + `' and '` + enddate + `'
                `
            ); //remove limit 20
            let [examtypename1] = await db.sequelize.query(
                `SELECT chapter_name as examname, chapt_id FROM tbl__schoolexamchapters Group by chapt_id`
            );
            let [examtypename2] = await db.sequelize.query(
                `SELECT extest_type as examname, extype_id FROM tbl__schoolexamtypes Group by extype_id`
            );

            let finalArr = [];
            for (let category of data) {
                let examtypename = [];
                if (category.examcat == 'C') {
                    examtypename = examtypename1.filter(e => e.chapt_id == category.examptype)
                }
                if (category.examcat == 'T') {
                    examtypename = examtypename2.filter(e => e.extype_id == category.examptype)
                }
                let examtypenameCount;
                if (examtypename.length != 0) {
                    examtypenameCount = examtypename[0].examname
                } else {
                    examtypenameCount = 0;
                }
                finalArr.push({
                    mastercategory: category.mastercategory,
                    maincategory: category.maincategory,
                    subcategory: category.subcategory,
                    examname: category.examname,
                    examcode: category.examcode,
                    examques: category.examques,
                    staffname: category.staffname,
                    examdate: new Date(category.examdate),
                    examtypename: examtypenameCount
                });
            }

            //let { processeddata } = await getTestData(data, startdate, enddate);
            res.send({
                count: data.length,
                qdata: finalArr
            });

        } catch (error) {
            next(error);
        }
    },
    getOverallMasters: async (req, res, next) => {
        try {
            const {
                period,
                startdate,
                enddate
            } = req.body;

            let [data] = await db.sequelize.query(
                `select ec3.exa_cat_name as mastercategory, ec2.exa_cat_name as maincategory, ec1.exa_cat_name as subcategory,
                ec3.exa_cat_id as masterid, ec2.exa_cat_id as mainid, ec1.exa_cat_id as subid
                from tbl__school_exam_category as ec1
                join tbl__school_exam_category as ec2 on ec1.exaid_sub = ec2.exa_cat_id
                join tbl__school_exam_category as ec3 on ec1.exaid = ec3.exa_cat_id 
				GROUP BY ec3.exa_cat_name, ec2.exa_cat_name, ec1.exa_cat_name
                `
            ); //remove limit 20

            let [totalquestions] = await db.sequelize.query(
                `select count(*) as totalquestions,ex.exam_cat, ex.exam_sub, ex.exam_sub_sub from tbl__schoolexamquestions as eq, tbl__schoolexam as ex where eq.exam_id = ex.exam_id and ex.exam_status <> 'D' and ex.exam_date between '` + startdate + `' and '` + enddate + `' Group by ex.exam_cat, ex.exam_sub, ex.exam_sub_sub`
            );
            let [topicwisereports] = await db.sequelize.query(
                `select count(*) as topicwisereports, exam_cat, exam_sub, exam_sub_sub from tbl__schoolexam where exam_type_cat = 'C' and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [fulltests] = await db.sequelize.query(
                `select count(*) as fulltests, exam_cat, exam_sub, exam_sub_sub from tbl__schoolexam where exam_type_cat = 'B' and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [secsubject] = await db.sequelize.query(
                `select count(*) as secsubject, exam_cat, exam_sub, exam_sub_sub from tbl__schoolexam where sect_cutoff = 'Y' and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [sectiming] = await db.sequelize.query(
                `select count(*) as sectiming, exam_cat, exam_sub, exam_sub_sub from tbl__schoolexam where sect_timing = 'Y' and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `' Group by exam_cat, exam_sub, exam_sub_sub`
            );

            let finalArr = [];
            for (let category of data) {
                let totalquestionsArr = totalquestions.filter(e => (e.exam_cat == category.masterid && e.exam_sub == category.mainid && e.exam_sub_sub == category.subid))
                let topicwisereportsArr = topicwisereports.filter(e => (e.exam_cat == category.masterid && e.exam_sub == category.mainid && e.exam_sub_sub == category.subid))
                let fulltestsArr = fulltests.filter(e => (e.exam_cat == category.masterid && e.exam_sub == category.mainid && e.exam_sub_sub == category.subid))
                let secsubjectArr = secsubject.filter(e => (e.exam_cat == category.masterid && e.exam_sub == category.mainid && e.exam_sub_sub == category.subid))
                let sectimingArr = sectiming.filter(e => (e.exam_cat == category.masterid && e.exam_sub == category.mainid && e.exam_sub_sub == category.subid))

                let totalquestionsCount;
                let topicwisereportsCount;
                let fulltestsCount;
                let secsubjectCount;
                let sectimingCount;
                if (totalquestionsArr.length != 0) {
                    totalquestionsCount = totalquestionsArr[0].totalquestions
                } else {
                    totalquestionsCount = 0;
                }
                if (topicwisereportsArr.length != 0) {
                    topicwisereportsCount = topicwisereportsArr[0].topicwisereports
                } else {
                    topicwisereportsCount = 0;
                }
                if (fulltestsArr.length != 0) {
                    fulltestsCount = fulltestsArr[0].fulltests
                } else {
                    fulltestsCount = 0;
                }
                if (secsubjectArr.length != 0) {
                    secsubjectCount = secsubjectArr[0].secsubject
                } else {
                    secsubjectCount = 0;
                }
                if (sectimingArr.length != 0) {
                    sectimingCount = sectimingArr[0].sectiming
                } else {
                    sectimingCount = 0;
                }
                //console.log(waitingCount);
                finalArr.push({
                    mastercategory: category.mastercategory,
                    maincategory: category.maincategory,
                    subcategory: category.subcategory,
                    totalquestions: totalquestionsCount,
                    topicwisereports: topicwisereportsCount,
                    fulltests: fulltestsCount,
                    secsubject: secsubjectCount,
                    sectiming: sectimingCount
                })
            }

            //let { processeddata } = await getOverallmasterData(data, startdate, enddate);
            res.send({
                count: data.length,
                qdata: finalArr
            });

        } catch (error) {
            next(error);
        }
    },

    getStudentReport: async (req, res, next) => {
        try {
            const { masterCategory, mainCategory, subCategory, chapterId, startDate, endDate, schoolId, isExcel } = req.body;

            let where = `etl.school_id=${schoolId} AND sec.exa_cat_id=${masterCategory}`
            if (mainCategory) where += ` AND sec1.exa_cat_id=${mainCategory}`;
            if (subCategory) where += ` AND sec2.exa_cat_id=${subCategory}`;
            if (chapterId) where += ` AND chapt.chapt_id=${chapterId}`;
            where += ` AND etl.start_time between '${startDate} 00:00:00' AND '${endDate} 23:59:59'`;

            let [data] = await db.sequelize.query(
                `SELECT
                sec.exa_cat_name as masterCategoryName,
                sec1.exa_cat_name as mainCategoryName,
                sec2.exa_cat_name as subCategoryName,
                chapt.chapter_name as chapterName,
                se.exam_name as examName,
                CONCAT(ss.stud_fname, ' ', ss.stud_lname) as studentName,
                ss.stud_email as studentEmail,
                ss.stud_mobile as studentMobileNumber,
                ss.stud_regno as studentRollNumber,
                etl.tot_quest as totalQuestion,
                etl.tot_attend as totalAttendQuestion,
                (etl.tot_quest - etl.tot_attend) as totalNotAttendQuestion,
                etl.answ_crt as totalCrtAnswer,
                etl.answ_wrong as totalWrongAnswer,
                (etl.tot_quest * etl.post_mark) as totalMark,
                etl.total_mark as scoredMark,
                etl.taken_id,
                etl.exam_id
            FROM
               tbl__schoolexamtaken_list as etl
               join tbl__schoolexam as se on se.exam_id = etl.exam_id
               join tbl__school_student as ss on ss.stud_id = etl.stud_id 
               join tbl__school_exam_category as sec on sec.exa_cat_id = se.exam_cat
               join tbl__school_exam_category as sec1 on sec1.exa_cat_id = se.exam_sub
               join tbl__school_exam_category as sec2 on sec2.exa_cat_id = se.exam_sub_sub
               left join tbl__schoolexamchapters as chapt on chapt.chapt_id = se.exam_type_id and se.exam_type_cat='C'
            WHERE
                ${where}`
            );
            await asyncForEach(data, async (oneDoc, index) => {
                if (Number(oneDoc.scoredMark) > 0) {
                    try {
                        let [result] = await db.sequelize.query(
                            `SELECT
                                *
                            FROM
                                tbl__schoolexamtaken_list as etl
                            WHERE
                                etl.exam_id=${oneDoc.exam_id} AND etl.exam_status="C" AND etl.total_mark > ${Number(oneDoc.scoredMark)} AND etl.taken_id != ${oneDoc.taken_id}
                            `
                        );
                        oneDoc.rank = result.length + 1;
                    } catch (e) {
                        oneDoc.rank = 0;
                    }
                } else {
                    oneDoc.rank = 0;
                }
            });
            let filter1 = data.filter(d => d.rank > 0);
            filter1 = filter1.sort((a, b) => { return a.rank - b.rank });
            let filter2 = data.filter(d => d.rank < 1);
            data = _.flatten([filter1, filter2]);
            if (isExcel) {
                let excelData = [];
                if (data && data.length) {
                    excelData = data.map(d => {
                        let obj = {
                            "Roll No": d.studentRollNumber,
                            "Name of the Student": d.studentName
                        };
                        if (!mainCategory) obj["Section"] = d.mainCategoryName;
                        if (!subCategory) obj["Subject"] = d.subCategoryName;
                        if (!chapterId) obj["Chapter"] = d.chapterName;
                        obj["Exam Name"] = d.examName;
                        obj["Total Mark"] = d.totalMark;
                        obj["Marks Scored"] = d.scoredMark;
                        obj["Rank"] = d.rank;
                        return obj;
                    });
                } else {
                    let obj = {
                        "Roll No": '',
                        "Name of the Student": ''
                    };
                    if (!mainCategory) obj["Section"] = '';
                    if (!subCategory) obj["Subject"] = '';
                    if (!chapterId) obj["Chapter"] = '';
                    obj["Exam Name"] = '';
                    obj["Total Mark"] = '';
                    obj["Marks Scored"] = '';
                    obj["Rank"] = 0;
                    excelData.push(obj);
                }
                /* make the worksheet */
                var ws = XLSX.utils.json_to_sheet(excelData);
                /* add to workbook */
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "StudentsReport");
                /* generate an XLSX file */
                let exportFileName = `studentReport.xls`;
                let filePath = path.join(__dirname, "../public/excels/studentReport.xls");
                XLSX.writeFile(wb, filePath);
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.studentReport.sheet"
                );
                res.setHeader("Content-Disposition", "attachment; filename=" + exportFileName);
                res.sendFile(filePath, function (err) {
                    console.log("Error downloading file: " + err);
                });
            } else {
                res.send({ data });
            }
        } catch (error) {
            console.log(error, 'error')
            next(error);
        }
    },

    getStudentQCReport: async (req, res, next) => {
        try {
            const { qcMasterCategory, qcMainCategory, qcSubCategory, chapterId, schoolId, startDate, endDate, isExcel } = req.body;

            let where = `etl.school_id=${schoolId} AND sec.exa_cat_id=${qcMasterCategory}`;
            if (qcMainCategory) where += ` AND sec1.exa_cat_id=${qcMainCategory}`;
            if (qcSubCategory) where += ` AND sec2.exa_cat_id=${qcSubCategory}`;
            if (chapterId) where += ` AND chapt.chapt_id=${chapterId}`;
            where += ` AND etl.start_time between '${startDate} 00:00:00' AND '${endDate} 23:59:59'`;

            let [data] = await db.sequelize.query(
                `SELECT
                    sec.exa_cat_name as masterCategoryName,
                    sec1.exa_cat_name as mainCategoryName,
                    sec2.exa_cat_name as subCategoryName,
                    chapt.chapter_name as chapterName,
                    se.exam_name as examName,
                    CONCAT(ss.stud_fname, ' ', ss.stud_lname) as studentName,
                    ss.stud_email as studentEmail,
                    ss.stud_mobile as studentMobileNumber,
                    ss.stud_regno as studentRollNumber,
                    etl.tot_quest as totalQuestion,
                    etl.tot_attend as totalAttendQuestion,
                    (etl.tot_quest - etl.tot_attend) as totalNotAttendQuestion,
                    etl.answ_crt as totalCrtAnswer,
                    etl.answ_wrong as totalWrongAnswer,
                    (etl.tot_quest * etl.post_mark) as totalMark,
                    etl.total_mark as scoredMark,
                    etl.taken_id,
                    etl.exam_id
            FROM
                tbl__schoolexamtaken_list_qc as etl
                join tbl__exam as se on se.exam_id = etl.exam_id
                join tbl__school_student as ss on ss.stud_id = etl.stud_id 
                join tbl__exam_category as sec on sec.exa_cat_id = se.exam_cat
                join tbl__exam_category as sec1 on sec1.exa_cat_id = se.exam_sub
                join tbl__exam_category as sec2 on sec2.exa_cat_id = se.exam_sub_sub
                left join tbl__examchapters as chapt on chapt.chapt_id = se.exam_type_id and se.exam_type_cat='C'
            WHERE
                ${where}`
            );

            await asyncForEach(data, async (oneDoc, index) => {
                if (Number(oneDoc.scoredMark) > 0) {
                    try {
                        let [result] = await db.sequelize.query(
                            `SELECT
                            *
                        FROM
                            tbl__schoolexamtaken_list_qc as etl
                        WHERE
                            etl.exam_id=${oneDoc.exam_id} AND etl.exam_status="C" AND etl.total_mark > ${Number(oneDoc.scoredMark)} AND etl.taken_id != ${oneDoc.taken_id}
                        `
                        );
                        oneDoc.rank = result.length + 1;
                    } catch (e) {
                        oneDoc.rank = 0;
                    }
                } else {
                    oneDoc.rank = 0;
                }
            });

            let filter1 = data.filter(d => d.rank > 0);
            filter1 = filter1.sort((a, b) => { return a.rank - b.rank });
            let filter2 = data.filter(d => d.rank < 1);
            data = _.flatten([filter1, filter2]);

            if (isExcel) {
                let excelData = [];
                if (data && data.length) {
                    excelData = data.map(d => {
                        let obj = {
                            "Roll No": d.studentRollNumber,
                            "Name of the Student": d.studentName
                        };
                        if (!qcMainCategory) obj["Section"] = d.mainCategoryName;
                        if (!qcSubCategory) obj["Subject"] = d.subCategoryName;
                        if (!chapterId) obj["Chapter"] = d.chapterName;
                        obj["Exam Name"] = d.examName;
                        obj["Total Mark"] = d.totalMark;
                        obj["Marks Scored"] = d.scoredMark;
                        obj["Rank"] = d.rank;
                        return obj;
                    });
                } else {
                    let obj = {
                        "Roll No": '',
                        "Name of the Student": ''
                    };
                    if (!qcMainCategory) obj["Section"] = '';
                    if (!qcSubCategory) obj["Subject"] = '';
                    if (!chapterId) obj["Chapter"] = '';
                    obj["Exam Name"] = '';
                    obj["Total Mark"] = '';
                    obj["Marks Scored"] = '';
                    obj["Rank"] = 0;
                    excelData.push(obj);
                }
                var ws = XLSX.utils.json_to_sheet(excelData);
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "StudentsReport");
                let exportFileName = `studentReport.xls`;
                let filePath = path.join(__dirname, "../public/excels/studentReport.xls");
                XLSX.writeFile(wb, filePath);
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.studentReport.sheet"
                );
                res.setHeader("Content-Disposition", "attachment; filename=" + exportFileName);
                res.sendFile(filePath, function (err) {
                    console.log("Error downloading file: " + err);
                });
            } else {
                res.send({ data });
            }
        } catch (error) {
            console.log(error, 'error')
            next(error);
        }
    },
};

// Function part
async function getOverallData(data, startdate, enddate) {
    try {
        return new Promise(async (resolve, reject) => {
            var whole_data = [];
            //console.log(data);

            for (let list of data) {
                //console.log(list)
                //data.forEach(async(list) => {
                //console.log(`select count(*) as uploaded from tbl__schoolquestion as que where que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`);
                let [uploaded] = await db.sequelize.query(
                    `select count(*) as uploaded from tbl__schoolquestion as que where que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [waiting] = await db.sequelize.query(
                    `select count(*) as waiting from tbl__schoolquestion as que where que.quest_status = 'W' and que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [active] = await db.sequelize.query(
                    `select count(*) as active from tbl__schoolquestion as que where que.quest_status = 'Y' and que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [inactive] = await db.sequelize.query(
                    `select count(*) as inactive from tbl__schoolquestion as que where que.quest_status = 'N' and que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                //console.log(uploaded[0].uploaded, 'Uploaded');
                whole_data.push({
                    maincategory: list.maincategory,
                    subcategory: list.subcategory,
                    subcategorycode: list.subcategorycode,
                    uploaded: uploaded[0].uploaded != 0 ? uploaded[0].uploaded : 0,
                    waiting: waiting[0].waiting != 0 ? waiting[0].waiting : 0,
                    active: active[0].active != 0 ? active[0].active : 0,
                    inactive: inactive[0].inactive != 0 ? inactive[0].inactive : 0
                });
            };
            //console.log("Final", whole_data);
            resolve({
                processeddata: whole_data
            });
        });
    } catch (error) {
        next(error);
    }
}

async function getMainData(data, startdate, enddate) {
    try {
        return new Promise(async (resolve, reject) => {
            var whole_data = [];
            //console.log(data);

            for (let list of data) {
                // console.log(list)
                let [uploaded] = await db.sequelize.query(
                    `select count(*) as uploaded from tbl__schoolquestion as que where que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );

                let [waiting] = await db.sequelize.query(
                    `select count(*) as waiting from tbl__schoolquestion as que where que.quest_status = 'W' and que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [active] = await db.sequelize.query(
                    `select count(*) as active from tbl__schoolquestion as que where que.quest_status = 'Y' and que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [inactive] = await db.sequelize.query(
                    `select count(*) as inactive from tbl__schoolquestion as que where que.quest_status = 'N' and que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                //console.log(uploaded[0].uploaded, 'Uploaded');
                whole_data.push({
                    maincategory: list.maincategory,
                    uploaded: uploaded[0].uploaded != 0 ? uploaded[0].uploaded : 0,
                    waiting: waiting[0].waiting != 0 ? waiting[0].waiting : 0,
                    active: active[0].active != 0 ? active[0].active : 0,
                    inactive: inactive[0].inactive != 0 ? inactive[0].inactive : 0
                });
            };
            // console.log("Final", whole_data);
            resolve({
                processeddata: whole_data
            });
        });
    } catch (error) {
        next(error);
    }
}
async function getTestData(data, startdate, enddate) {
    try {
        return new Promise(async (resolve, reject) => {
            var whole_data = [];

            for (let list of data) {
                let examtypename;
                if (list.examcat == 'C') {
                    examtypename = await db.sequelize.query(
                        `SELECT chapter_name as examname FROM tbl__schoolexamchapters where chapt_id = ` + list.examptype
                    );
                } else if (list.examcat == 'T') {
                    examtypename = await db.sequelize.query(
                        `SELECT extest_type as examname FROM tbl__schoolexamtypes where extype_id = ` + list.examptype
                    );
                }
                //console.log(examtypename[0]);
                //console.log(examtypename[0][0].examname);
                whole_data.push({
                    mastercategory: list.mastercategory,
                    maincategory: list.maincategory,
                    subcategory: list.subcategory,
                    examname: list.examname,
                    examcode: list.examcode,
                    examques: list.examques,
                    staffname: list.staffname,
                    examdate: new Date(list.examdate),
                    examtypename: examtypename ? examtypename[0][0].examname : 'Not Available'
                });
            }

            //console.log("Final", whole_data);
            resolve({
                processeddata: whole_data
            });
        });
    } catch (error) {
        next(error);
    }

}

async function getOverallmasterData(data, startdate, enddate) {
    try {
        return new Promise(async (resolve, reject) => {
            var whole_data = [];
            // console.log(data);

            for (let list of data) {
                //   console.log(list);
                let [totalquestions] = await db.sequelize.query(
                    `select count(*) as totalquestions from tbl__schoolexamquestions where exam_id in (select exam_id from tbl__schoolexam where exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `' Group by exam_cat, exam_sub, exam_sub_sub)`
                );
                let [topicwisereports] = await db.sequelize.query(
                    `select count(*) as topicwisereports from tbl__schoolexam where exam_type_cat = 'C' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
                );
                let [fulltests] = await db.sequelize.query(
                    `select count(*) as fulltests from tbl__schoolexam where exam_type_cat = 'B' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
                );
                let [secsubject] = await db.sequelize.query(
                    `select count(*) as secsubject from tbl__schoolexam where sect_cutoff = 'Y' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
                );
                let [sectiming] = await db.sequelize.query(
                    `select count(*) as sectiming from tbl__schoolexam where sect_timing = 'Y' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
                );
                whole_data.push({
                    mastercategory: list.mastercategory,
                    maincategory: list.maincategory,
                    subcategory: list.subcategory,
                    totalquestions: totalquestions[0].totalquestions != 0 ? totalquestions[0].totalquestions : 0,
                    topicwisereports: topicwisereports[0].topicwisereports != 0 ? topicwisereports[0].topicwisereports : 0,
                    fulltests: fulltests[0].fulltests != 0 ? fulltests[0].fulltests : 0,
                    secsubject: secsubject[0].secsubject != 0 ? secsubject[0].secsubject : 0,
                    sectiming: sectiming[0].sectiming != 0 ? sectiming[0].sectiming : 0
                });
            };
            //console.log("Final", whole_data);
            resolve({
                processeddata: whole_data
            });
        });
    } catch (error) {
        next(error);
    }
}