const db = require("../../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const logger = require("../../helper/userLogger");
const { ImageFilter } = require("../../helper/general_helper");
require("dotenv").config();
const _ = require("underscore");

//-------------------------- Multer Part Start --------------------------------------//

var profilesDir = path.join(process.env.schoolStudents);
fs.existsSync(profilesDir) || fs.mkdirSync(profilesDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.schoolStudents);
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
    // 1. Results Summary User
    getAllResults: async (req, res, next) => {
        try {
            let stud_id = req.user.id;
            const { count, rows } = await db.Examtakenlist.findAndCountAll({
                where: { 
                    stud_id, 
                    exam_status: "C",
                    [Op.or]: [{ exam_type:"C" }, { exam_type:"B" },{ exam_type:"D" }],
                },
                // limit: 10,
                order: [["lastupdate", "DESC"]],
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });

            if (count > 0) {
                let resultArray = [];

                for (let item of rows) {
                    let { examTitle, masterCategoryName, examName, sectionTotalQue } = await getExamTitle(
                        item.exam_id
                    ).catch((err) => {
                        examTitle = "";
                        masterCategoryName = "";
                        examName = "";
                        sectionTotalQue = 0;
                    });
                    let totalMark = item.tot_quest * item.post_mark;
                    if(sectionTotalQue > 0 ){
                        totalMark = sectionTotalQue * item.post_mark;
                    }
                    let examDate = item.lastupdate;
                    let scoredMark = item.total_mark;
                    let start = item.start_time;
                    let end = item.end_time;

                    var duration = moment.utc(moment(end,"DD/MM/YYYY HH:mm:ss").diff(moment(start,"DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                    var minutes = moment.duration(duration).asMinutes();

                    // 3. Get Rank for this totalMarks
                    let rank = 0;
                    rank = await db.Examtakenlist.count({
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
                    examcount = await db.Examtakenlist.count({
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
                    totalAttend = await db.Examtakenlist.count({
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

    // 2. Performance Chart User
    getPerformanceChart: async (req, res, next) => {
        try {
            let { id } = req.user;
            const [chartDatas, metadata] = await db.sequelize
                .query(
                    `SELECT ROUND(AVG(A.total_mark), 2) AS data, B.exam_name as label, 
                    (CASE B.exam_type_cat  WHEN "C" THEN D.chapter_name ELSE E.extest_type END) as catLabel 
                    FROM tbl__examtaken_list as A INNER JOIN tbl__exam as B ON B.exam_id = A.exam_id 
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

    // 3. Search
    getSearchResult: async (req, res, next) => {
        try {
            const [searchDatas, metadata] = await db.sequelize
                .query(
                    `SELECT b.exa_cat_name as "MasterCategory", c.exa_cat_name as "MainCategory", b.exa_cat_image as "logo", a.* FROM tbl__exam_category as a
                inner join tbl__exam_category as b on b.exa_cat_id = a.exaid 
                inner join tbl__exam_category as c on c.exa_cat_id = a.exaid_sub 
                where a.examcat_type = "S" and a.exa_cat_status = "Y" and b.exa_cat_status = "Y" and c.exa_cat_status = "Y"`,
                    { replacements: [] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ count: searchDatas.length, result: searchDatas });
        } catch (error) {
            next(error);
        }
    },
};

// Get Exam Title
function getExamTitle(exam_id) {
    return new Promise(async (resolve, reject) => {
        let examTitle = "";
        let sectionTotalQue = 0;
        // Get Exam Details in Exam Table
        const { count, rows } = await db.Exams.findAndCountAll({
            where: {
                exam_id,
                //exam_status: "Y",
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
                        WHERE a.examcat_type='S' AND a.exa_cat_id=?
                    `,
                    { replacements: [rows[0].exam_sub_sub] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });

            // 4. check topic wise test or else
            if (rows[0].exam_type_cat === "C") {
                const examChapter = await db.ExamChapters.findOne({
                    where: { chapt_id: rows[0].exam_type_id },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                // examTitle = `${categoryName.exa_cat_name} - ${subCategoryName.exa_cat_name} - Topic Wise Test - ${examChapter.chapter_name}`;
                examTitle = `${category[0].category} - ${category[0].subCategory} - Topic Wise Test - ${examChapter.chapter_name}`;
            } else if (rows[0].exam_type_cat === "T") {
                const examType = await db.ExamTypes.findOne({
                    where: { extype_id: rows[0].exam_type_id },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                if (category) {
                //  examTitle = `${categoryName.exa_cat_name} - ${subCategoryName.exa_cat_name} - ${examType.extest_type}`;
                examTitle = `${category[0].category} - ${category[0].subCategory} - ${examType.extest_type}`;
                } else {
                    examTitle = 'TEST';
                }
            }
            if(rows[0].exam_type === "D"){
                const section = await db.sequelize.query(`SELECT * FROM tbl__exam_sectdetails WHERE exam_id=${exam_id}`)
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                console.log(section , '111111111111')
                let ques_ans = _.pluck(section[0],'ques_ans');
                console.log(ques_ans , '22222222222')
                if(ques_ans && ques_ans.length > 0 ) sectionTotalQue = ques_ans.reduce((a, b) => a + b);
                console.log(sectionTotalQue , '3333333333333')
            }
            resolve({
                examTitle,
                masterCategoryName: category[0].masterCategory,
                examName: rows[0].exam_name,
                sectionTotalQue
            });
        } else {
            resolve({
                examTitle : "",
                masterCategoryName: "",
                examName: "",
                sectionTotalQue : 0
            });
        }
    });
}
