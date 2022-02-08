const db = require("../../Models");
const createError = require("http-errors");
const logger = require("../../helper/userLogger");

module.exports = {
    // 1. Get All Exam School
    getAllExam: async (req, res, next) => {
        try {
            //    let logintype = req.user.logintype;
            const [Allexam] = await db.sequelize.query(
                `select a.exa_cat_id as 'masterId',b.exa_cat_id as 'categoryId'
                ,a.exa_cat_pos,a.exa_cat_name as 'Master name',
                b.exa_cat_name as 'Category name',b.exa_cat_image as 'thumbimage' 
                from 
                tbl__schoolexam_category as a
                inner join tbl__schoolexam_category as b 
                on a.exa_cat_id=b.exaid and b.examcat_type='C'
                where a.exa_cat_status='Y' and a.exaid=0 and
                 a.examcat_type='M' order by a.exa_cat_pos,
                 a.exa_cat_name,b.exa_cat_pos`,
                { replacements: [] }
            );
            res.send({ count: Allexam.length, Allexam });
        } catch (error) {
            logger.error(`Error at Get All Exam School : ${error.message}`);
            next(error);
        }
    },

    // Get Master School
    getMaster: async (req, res, next) => {
        try {
            //    let logintype = req.user.logintype;
            const { count, rows } = await db.SchoolExamMainCategory.findAndCountAll({
                where: {
                    exaid: 0,
                    exa_cat_status: "Y",
                    examcat_type: "M",
                    exa_cat_id: req.user.mastercatid,
                    schoolid: req.user.schoolId,
                },
                order: [["exa_cat_name"]],
            });

            if (!rows) {
                throw createError.NotFound("Master category not found.");
            }
            res.send({ count, mastercategory: rows });
        } catch (error) {
            logger.error(`Error at Get Master School : ${error.message}`);
            next(error);
        }
    },

    // Get Category School
    getCategory: async (req, res, next) => {
        try {
            let { master_id } = req.params;
            const category = await db.SchoolExamMainCategory.findAll({
                where: {
                    exaid: master_id,
                    exa_cat_status: "Y",
                    examcat_type: "C",
                    schoolid: req.user.schoolId
                },
                order: [["exa_cat_id"]],
            });

            const [subcategory] = await db.sequelize.query(
                `select b.*
            from  tbl__school_exam_category as a
            inner join tbl__school_exam_category as b on 
            a.exa_cat_id=b.exaid_sub and a.exaid=? and b.examcat_type='S' 
            and b.exa_cat_status='Y'
            where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
            and a.schoolid=?
            order by b.exa_cat_id`,
                { replacements: [master_id, master_id, req.user.schoolId] }
            );

            const [chapters] = await db.sequelize.query(
                `select c.*
            from  tbl__school_exam_category as a
            inner join tbl__school_exam_category as b on a.exa_cat_id=b.exaid_sub and
             a.exaid=? and b.examcat_type='S' and b.exa_cat_status='Y'
            inner join tbl__schoolexamchapters as c on b.exa_cat_id=c.exa_cat_id 
            where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
            order by c.chapt_id`,
                { replacements: [master_id, master_id] }
            );


            const [types] = await db.sequelize.query(
                `select c.*
            from  tbl__school_exam_category as a
            inner join tbl__school_exam_category as b on a.exa_cat_id=b.exaid_sub 
            and a.exaid=? and b.examcat_type='S' and b.exa_cat_status='Y'
            inner join tbl__schoolexamtypes as c on b.exa_cat_id=c.exa_cat_id and
             c.extype_status='Y'
            where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
            order by c.extype_id`,
                { replacements: [master_id, master_id] }
            );
            const [exams] = await db.sequelize.query(
                `select * from tbl__schoolexam where exam_cat = ? and exam_status = 'Y' and schoolid = ?`,
                { replacements: [master_id, req.user.schoolId] }
            );
            res.send({
                category: category,
                subcategory: subcategory,
                chapters: chapters,
                types: types,
                exams: exams
            });

        } catch (error) {
            logger.error(`Error at Get Category School : ${error.message}`);
            next(error);
        }
    },

    // Get Chapter List School
    getChapterList: async (req, res, next) => {
        try {
            let { sub_id } = req.params;

            const [chapters] = await db.sequelize.query(
                `select a.*,b.* 
                from tbl__schoolexamchapters as a 
                inner join tbl__schoolexam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
                where  a.exa_cat_id=? and a.schoolid=?
                group by a.chapt_id,b.assign_test_type
                order by a.chapt_id,b.exam_id`,
                { replacements: [sub_id, req.user.schoolId] }
            );

            const [chapterlist] = await db.sequelize.query(
                `select a.*,b.*,c.exa_cat_name as 'Category',d.exa_cat_name as 'Subcategory'
            from tbl__schoolexamchapters as a 
            left join tbl__schoolexam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
            inner join tbl__school_exam_category as c on a.exsub_cat=c.exa_cat_id
            inner join tbl__school_exam_category as d on a.exa_cat_id=d.exa_cat_id
            where  a.exa_cat_id=? and a.schoolid=?
             order by b.exam_name`,
                { replacements: [sub_id, req.user.schoolId] }
            );
            res.send({ count: chapterlist.length, chapters, chapterlist });

        } catch (error) {
            logger.error(`Error at Get Chapter List School : ${error.message}`);
            next(error);
        }
    },

    // Get Chapter Wise School
    getChapterWise: async (req, res, next) => {
        try {
            let { chapter_id } = req.params;

            const [chapterwiselist] = await db.sequelize.query(
                `select a.*,b.exa_cat_name as 'Category',c.exa_cat_name as 'Subcategory',
                d.chapter_name as 'Chaptername' from tbl__schoolexam as a
                inner join tbl__school_exam_category as b on a.exam_sub=b.exa_cat_id
                inner join tbl__school_exam_category as c on a.exam_sub_sub=c.exa_cat_id
                inner join tbl__schoolexamchapters as d on a.exam_type_id=d.chapt_id
                where a.exam_type_cat='C' and a.exam_status='Y' and a.exam_type_id=?
                and a.schoolid=?
                `,
                { replacements: [chapter_id, req.user.schoolId] }
            );
            res.send({ count: chapterwiselist.length, chapterwiselist });
        } catch (error) {
            logger.error(`Error at Get Chapter Wise School : ${error.message}`);
            next(error);
        }
    },

    // Get Typewise School
    getTypeWise: async (req, res, next) => {
        try {
            let { types_id } = req.params;
            const [typewiselist] = await db.sequelize.query(
                `select a.*,b.exa_cat_name as 'Category',c.exa_cat_name as
                 'Subcategory',d.extest_type as 'Chaptername' from tbl__schoolexam as a
                inner join tbl__school_exam_category as b on a.exam_sub=b.exa_cat_id
                inner join tbl__school_exam_category as c on a.exam_sub_sub=c.exa_cat_id
                inner join tbl__schoolexamtypes as d on a.exam_type_id=extype_id
                where a.exam_type_cat='T' and a.exam_status='Y' and a.exam_type_id=?
                and a.schoolid=?`,
                { replacements: [types_id, req.user.schoolId] }
            );
            res.send({ count: typewiselist.length, typewiselist });
        } catch (error) {
            logger.error(`Error at Get Typewise School : ${error.message}`);
            next(error);
        }
    },

    // Get Home Catgegory School
    getHomeCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.HomeCategory.findAndCountAll({
                where: {
                    exa_cat_status: "Y",
                },
                order: [["exa_cat_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Master category not found.");
            }
            res.send({ count, homecategory: rows });
        } catch (error) {
            logger.error(`Error at Get Home Category School : ${error.message}`);
            next(error);
        }
    },

    // Get Topic Wise Test School
    getTopicWiseTest: async (req, res, next) => {
        try {
            let { sub_id } = req.params;
            const [chapterlist] = await db.sequelize.query(
                `select a.*,b.*,c.exa_cat_name as 'Category',d.exa_cat_name as 'Subcategory'
            from tbl__schoolexamchapters as a 
            left join tbl__schoolexam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
            inner join tbl__school_exam_category as c on a.exsub_cat=c.exa_cat_id
            inner join tbl__school_exam_category as d on a.exa_cat_id=d.exa_cat_id
            where  a.exa_cat_id=? and a.schoolid`,
                { replacements: [sub_id, req.user.schoolId] }
            );
            let chapterWiselist = chapterlist.reduce((r, a) => {
                r[a.chapt_id] = [...(r[a.chapt_id] || []), a];
                return r;
            }, {});
            res.send({ count: chapterWiselist.length, chapterlist: chapterWiselist });
        } catch (error) {
            logger.error(`Error at Get Topic Wise Test School : ${error.message}`);
            next(error);
        }
    },
    getChapterWiseList: async (req, res, next) => {
        try {
            let { chapter_id } = req.params;
            const [chapterlist] = await db.sequelize.query(
                `select a.*,b.exa_cat_name as 'Category',c.exa_cat_name as
                 'Subcategory',d.chapter_name as 'Chaptername' from tbl__schoolexam as a
                inner join tbl__school_exam_category as b on a.exam_sub=b.exa_cat_id
                inner join tbl__school_exam_category as c on a.exam_sub_sub=c.exa_cat_id
                inner join tbl__schoolexamchapters as d on a.exam_type_id=d.chapt_id
                where a.exam_type='C' and a.exam_status='Y' 
                and a.exam_type_id=? and a.assign_test_type='M'`,
                { replacements: [chapter_id] }
            );
            res.send({ count: chapterlist.length, chapterlist });
        } catch (error) {
            next(error);
        }
    },

    getAllExamCategory: async (req, res, next) => {
        try {
            const [category] = await db.sequelize.query(
                `select * from tbl__school_exam_category as a 
                INNER JOIN tbl__schoolexam as c on c.exam_cat = a.exa_cat_id and c.schoolid = ?
                where a.exa_cat_status= "Y" and a.examcat_type= "M" and a.exa_cat_id = ?
                and c.exam_status='Y'
                group by a.exa_cat_id order by exa_cat_pos`,
                { replacements: [req.user.schoolId, req.user.mastercatid] }
            );

            const [subcategory] = await db.sequelize.query(
                `select b.*
                from  tbl__school_exam_category as a
                inner join tbl__school_exam_category as b on 
                a.exa_cat_id=b.exaid and b.examcat_type='C' 
                INNER JOIN tbl__schoolexam as c on c.exam_sub = b.exa_cat_id and c.schoolid = ?
                and b.exa_cat_status='Y' where b.exaid = ? GROUP BY b.exa_cat_id 
                order by b.exa_cat_id`,
                { replacements: [req.user.schoolId, req.user.mastercatid] }
            );

            res.send({
                category: category,
                subcategory: subcategory,
            });
        } catch (error) {
            logger.error(`Error at All Category User: ${error.message}`);
            next(error);
        }
    },
};

async function groupBy(objectArray, property) {
    return await objectArray.reduce(function (acc, obj) {
        var key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}
