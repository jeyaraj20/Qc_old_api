const db = require("../../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../../helper/userLogger");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const { ImageFilter } = require("../../helper/general_helper");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        // Ensure Questions Directory directory exists
        var profilesDir = path.join(`${process.env.schoolStudents}/${req.user.schoolId}`);
        fs.existsSync(profilesDir) || fs.mkdirSync(profilesDir);

        callBack(null, `${process.env.schoolStudents}/${req.user.schoolId}`);
    },
    filename: (req, file, callBack) => {
        callBack(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: ImageFilter,
    limits: { fileSize: "2mb" },
}).fields([
    {
        name: "stud_image",
        maxCount: 1,
    },
]);

//-------------------------- Multer Part End ---------------------------------------//

module.exports = {
    // 1. Results Summary School
    getAllResults: async (req, res, next) => {
        try {
            let stud_id = req.user.id;
            const { count, rows } = await db.SchoolExamtakenlistQc.findAndCountAll({
                where: { stud_id, exam_status: "C" },
                // limit: 10,
                order: [["lastupdate", "DESC"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (count > 0) {
                let resultArray = [];

                for (let item of rows) {
                    let { examTitle, masterCategoryName, examName } = await getExamTitle(
                        //let {  masterCategoryName, examName } = await getExamTitle(

                        item.exam_id
                    ).catch((err) => {
                        examTitle = "";
                        masterCategoryName = "";
                        examName = "";
                    });
                    let totalMark = item.tot_quest * item.post_mark;
                    let examDate = item.lastupdate;
                    let scoredMark = item.total_mark;
                    let start = item.start_time;
                    let end = item.end_time;

                    var duration = moment.utc(moment(end,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                    var minutes = moment.duration(duration).asMinutes();

                    // 3. Get Rank for this totalMarks
                    let rank = 0;
                    rank = await db.SchoolExamtakenlistQc.count({
                        where: {
                            exam_id: item.exam_id,
                            exam_status: "C",
                            total_mark: { [Op.gt]: item.total_mark },
                            taken_id: { [Op.ne]: item.taken_id },
                        },
                    }).catch((err) => {
                        // throw createError.InternalServerError(err.message);
                        rank = 0;
                    });

                    let examcount = 0;
                    examcount = await db.SchoolExamtakenlistQc.count({
                        where: {
                            exam_id: item.exam_id,
                            exam_status: "C",
                        },
                    }).catch((err) => {
                        // throw createError.InternalServerError(err.message);
                        examcount = 0;
                    });
                    //console.log(Math.trunc(minutes));
                    //console.log("count:", examcount)
                    let avgTime = (Math.trunc(minutes)) / examcount;
                    //console.log(avgTime);

                    // 4. Total Attended Students
                    let totalAttend = 0;
                    totalAttend = await db.SchoolExamtakenlistQc.count({
                        where: {
                            exam_id: item.exam_id,
                            exam_status: "C",
                        },
                    }).catch((err) => {
                        // throw createError.InternalServerError(err.message);
                        totalAttend = 0;
                    });

                    const [logoUrl] = await db.sequelize
                        .query(
                            `SELECT c.exa_cat_image, b.total_time FROM tbl__examtaken_list as a INNER JOIN tbl__exam as b on a.exam_id = b.exam_id
                        inner join tbl__exam_category as c on c.exa_cat_id = b.exam_sub
                        WHERE taken_id = ?`,
                            { replacements: [item.taken_id] }
                        )
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                    resultArray.push({
                        examDate,
                        examCategoryName: masterCategoryName,
                        examTitle: `${examTitle} - ${examName}`,
                        totalMark,
                        scoredMark,
                        rank: rank + 1,
                        totalRank: totalAttend,
                        logoUrl: logoUrl,
                        examName: examName,
                        exam_id: item.exam_id,
                        taken_id: item.taken_id,
                        timetaken: Math.trunc(minutes),
                        avgtime: Math.trunc(avgTime)
                    });
                }
                res.send({ resultSummary: resultArray });
            } else {
                res.send({ status: 404, message: "No Result Found" });
            }
        } catch (error) {
            logger.error(`Error at Results Summary User : ${error.message}`);
            next(error);
        }
    },

    getAllMyExamResults: async (req, res, next) => {
        try {
            let stud_id = req.user.id;
            const { count, rows } = await db.SchoolExamtakenlist.findAndCountAll({
                where: { stud_id, exam_status: "C" },
                limit: 10,
                order: [["lastupdate", "DESC"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (count > 0) {
                let resultArray = [];

                for (let item of rows) {
                    let { examTitle, masterCategoryName, examName } = await getMyExamTitle(
                        item.exam_id, req.user.schoolId
                    ).catch((err) => {
                        examTitle = "";
                        masterCategoryName = "";
                        examName = "";
                    });
                    let totalMark = item.tot_quest * item.post_mark;
                    let examDate = item.lastupdate;
                    let scoredMark = item.total_mark;
                    let start = item.start_time;
                    let end = item.end_time;

                    var duration = moment.utc(moment(end,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                    var minutes = moment.duration(duration).asMinutes();

                    // 3. Get Rank for this totalMarks
                    let rank = 0;
                    rank = await db.SchoolExamtakenlist.count({
                        where: {
                            exam_id: item.exam_id,
                            exam_status: "C",
                            total_mark: { [Op.gt]: item.total_mark },
                            taken_id: { [Op.ne]: item.taken_id },
                        },
                    }).catch((err) => {
                        // throw createError.InternalServerError(err.message);
                        rank = 0;
                    });

                    let examcount = 0;
                    examcount = await db.SchoolExamtakenlist.count({
                        where: {
                            exam_id: item.exam_id,
                            exam_status: "C",
                        },
                    }).catch((err) => {
                        // throw createError.InternalServerError(err.message);
                        examcount = 0;
                    });
                    //console.log(Math.trunc(minutes));
                    //console.log("count:", examcount)
                    let avgTime = (Math.trunc(minutes)) / examcount;
                    //console.log(avgTime);

                    // 4. Total Attended Students
                    let totalAttend = 0;
                    totalAttend = await db.SchoolExamtakenlist.count({
                        where: {
                            exam_id: item.exam_id,
                            exam_status: "C",
                        },
                    }).catch((err) => {
                        // throw createError.InternalServerError(err.message);
                        totalAttend = 0;
                    });

                    const [logoUrl] = await db.sequelize
                        .query(
                            `SELECT c.exa_cat_image, b.total_time FROM tbl__schoolexamtaken_list as a INNER JOIN tbl__schoolexam as b on a.exam_id = b.exam_id
                        inner join tbl__school_exam_category as c on c.exa_cat_id = b.exam_sub
                        WHERE taken_id = ? and school_id = ?`,
                            { replacements: [item.taken_id, req.user.schoolId] }
                        )
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });

                    resultArray.push({
                        examDate,
                        examCategoryName: masterCategoryName,
                        examTitle: `${examTitle} - ${examName}`,
                        totalMark,
                        scoredMark,
                        rank: rank + 1,
                        totalRank: totalAttend,
                        logoUrl: logoUrl,
                        examName: examName,
                        exam_id: item.exam_id,
                        taken_id: item.taken_id,
                        timetaken: Math.trunc(minutes),
                        avgtime: Math.trunc(avgTime)
                    });
                }
                res.send({ resultSummary: resultArray });
            } else {
                res.send({ status: 404, message: "No Result Found" });
            }
        } catch (error) {
            logger.error(`Error at Results Summary User : ${error.message}`);
            next(error);
        }
    },

    // 2. Performance Chart School
    getPerformanceChart: async (req, res, next) => {
        try {
            let { id } = req.user;
            const [chartDatas, metadata] = await db.sequelize
                .query(
                    `SELECT ROUND(AVG(A.total_mark), 2) AS data, B.exam_name as label, 
                    (CASE B.exam_type_cat  WHEN "C" THEN D.chapter_name ELSE E.extest_type END) as catLabel 
                    FROM tbl__schoolexamtaken_list_qc as A INNER JOIN tbl__exam as B ON B.exam_id = A.exam_id 
                    INNER JOIN tbl__exam_category AS C on C.exa_cat_id = B.exam_sub_sub 
                    LEFT JOIN tbl__examchapters AS D ON D.chapt_id = B.exam_type_id
                    LEFT JOIN tbl__examtypes AS E ON E.extype_id = B.exam_type_id
                    WHERE A.stud_id = ? AND A.exam_status = "C" GROUP BY A.exam_id ORDER BY A.lastupdate DESC`,
                    { replacements: [id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            let label = [];
            let data = [];
            for (let chartData of chartDatas) {
                label.push(`${chartData.catLabel} - ${chartData.label}`);
                data.push(chartData.data);
            }
            res.send({ label, data });
        } catch (error) {
            logger.error(`Error at Performance Chart User : ${error.message}`);
            next(error);
        }
    },


    getMyExamPerformanceChart: async (req, res, next) => {
        try {
            let { id } = req.user;
            const [chartDatas, metadata] = await db.sequelize
                .query(
                    `SELECT ROUND(AVG(A.total_mark), 2) AS data, B.exam_name as label, 
                    (CASE B.exam_type_cat  WHEN "C" THEN D.chapter_name ELSE E.extest_type END) as catLabel 
                    FROM tbl__schoolexamtaken_list as A INNER JOIN tbl__schoolexam as B ON B.exam_id = A.exam_id 
                    INNER JOIN tbl__school_exam_category AS C on C.exa_cat_id = B.exam_sub_sub 
                    LEFT JOIN tbl__schoolexamchapters AS D ON D.chapt_id = B.exam_type_id
                    LEFT JOIN tbl__schoolexamtypes AS E ON E.extype_id = B.exam_type_id
                    WHERE A.stud_id = ? AND A.exam_status = "C" GROUP BY A.exam_id ORDER BY A.lastupdate DESC`,
                    { replacements: [id] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            let label = [];
            let data = [];
            for (let chartData of chartDatas) {
                label.push(`${chartData.catLabel} - ${chartData.label}`);
                data.push(chartData.data);
            }
            res.send({ label, data });
        } catch (error) {
            logger.error(`Error at Performance Chart User : ${error.message}`);
            next(error);
        }
    },

    // Get Profile By ID School
    getProfile: async (req, res, next) => {
        try {
            const { stud_id } = req.params;
            if (!stud_id) throw createError.BadRequest();

            const stud = await db.SchoolStudent.findOne({
                where: { stud_id, stud_status: { [Op.ne]: "D" } },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (stud) {
                res.send({ status: true, message: stud });
            } else {
                throw createError.NotFound("Student Not Found !!!");
            }
        } catch (error) {
            logger.error(`Error at Get Profile By ID School : ${error.message}`);
            next(error);
        }
    },

    // 8. Update Profile School
    updateProfile: async (req, res, next) => {
        try {
            upload(req, res, function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }

                const { stud_id } = req.params;
                if (!stud_id) throw createError.BadRequest();

                db.sequelize.transaction(async (t) => {
                    await db.SchoolStudent.update(
                        { ...req.body, stud_image: req.files.stud_image[0].filename },
                        { where: { stud_id, stud_status: { [Op.ne]: "D" } } }
                    ).catch((err) => {
                        throw createError.InternalServerError(err.message);
                    });

                    res.send({ status: true, message: "User Profile Updated" });
                });
            });
        } catch (error) {
            logger.error(`Error at Update Profile School : ${error.message}`);
            next(error);
        }
    },
};

// Get Exam Title School
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
            // 1. Master Category Name
            // const masterCategoryName = await db.ExamMainCategory.findOne({
            //     where: { exa_cat_id: rows[0].exam_cat, exa_cat_status: "Y" },
            // }).catch((err) => {
            //     throw createError.InternalServerError(err.message);
            // });

            // 2. Get Category Name
            // const categoryName = await db.ExamMainCategory.findOne({
            //     where: { exa_cat_id: rows[0].exam_sub, exa_cat_status: "Y" },
            // }).catch((err) => {
            //     throw createError.InternalServerError(err.message);
            // });

            //  3. Get Sub Category Name
            // const subCategoryName = await db.ExamMainCategory.findOne({
            //     where: { exa_cat_id: rows[0].exam_sub_sub, exa_cat_status: "Y" },
            // }).catch((err) => {
            //     throw createError.InternalServerError(err.message);
            // });

            // 1. Master Category Name, 2. Get Category Name, 3. Get Sub Category Name
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
                examTitle = `${category[0].category} - ${category[0].subCategory} - Topic Wise Test - ${examChapter.chapter_name}`;
            } else if (rows[0].exam_type_cat === "T") {
                const examType = await db.ExamTypes.findOne({
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
                examName: rows[0].exam_name,
            });
        } else {
            reject("No Title Avail");
        }
    });
}

function getMyExamTitle(exam_id, schoolId) {
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
                        AND c.exa_cat_status='Y' AND a.exa_cat_id=? AND a.schoolid = ?
                    `,
                    { replacements: [rows[0].exam_sub_sub, schoolId] }
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
                examName: rows[0].exam_name,
            });
        } else {
            reject("No Title Avail");
        }
    });
}
