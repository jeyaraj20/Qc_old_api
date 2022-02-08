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
                limit: 10,
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

                    resultArray.push({
                        examDate,
                        examCategoryName: masterCategoryName,
                        examTitle:  `${examTitle} - ${examName}`,
                        totalMark,
                        scoredMark,
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
            logger.error(`Error at Performance Chart School : ${error.message}`);
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
                examName: rows[0].exam_name,
            });
        } else {
            reject("No Title Avail");
        }
    });
}
