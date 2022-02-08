const db = require("../../Models");
const createError = require("http-errors");
const logger = require("../../helper/userLogger");

module.exports = {
    // 1. Get All Category User
    getAllExam: async (req, res, next) => {
        try {
            //    let logintype = req.user.logintype;
            const [Allexam] = await db.sequelize.query(
                `select a.exa_cat_id as 'masterId',b.exa_cat_id as 'categoryId' ,a.exa_cat_pos,a.exa_cat_name as 'Master name',
                b.exa_cat_name as 'Category name',b.exa_cat_image as 'thumbimage' from tbl__exam_category as a
                inner join tbl__exam_category as b on a.exa_cat_id=b.exaid and b.examcat_type='C'
                where a.exa_cat_status='Y' and a.exaid=0 and a.examcat_type='M' order by a.exa_cat_pos,
                a.exa_cat_name,b.exa_cat_pos`,
                { replacements: [] }
            );
            res.send({ count: Allexam.length, Allexam });
        } catch (error) {
            logger.error(`Error at Get All Category User : ${error.message}`);
            next(error);
        }
    },

    // 2. Get All Master Category User
    getMaster: async (req, res, next) => {
        try {
            //    let logintype = req.user.logintype;
            const { count, rows } = await db.ExamMainCategory.findAndCountAll({
                include: [{ model: db.ExamRatings, requierd: false, attributes: ["exa_rating"] }],
                where: {
                    exaid: 0,
                    exa_cat_status: "Y",
                    examcat_type: "M",
                },
                order: [["exa_cat_name"]],
            });

            if (!rows) {
                throw createError.NotFound("Master category not found.");
            }
            res.send({ count, mastercategory: rows });
        } catch (error) {
            logger.error(`Error at Get All Master Category User : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Category User
    getCategory: async (req, res, next) => {
        try {
            let { master_id } = req.params;
            /*  const category = await db.ExamMainCategory.findAll({
                  where: {
                      exaid: master_id,
                      exa_cat_status: "Y",
                      examcat_type: "C",
                  },
                  order: [["exa_cat_id"]],
              });
              */
            const [category] = await db.sequelize.query(
                `select d.package_status, a.*, b.*, c.exa_rating as exa_rating, c.exa_icon_image as exa_icon_image from tbl__exam_category as a 
               inner join tbl__exam as b on a.exa_cat_id=b.exam_sub
               left join tbl__exam_ratings as c on a.exa_cat_id=c.exa_cat_id 
               LEFT JOIN tbl__exampackage as d on d.main_cat = a.exa_cat_id and d.sub_cat=0 and d.package_status = 'Y'
               where a.exa_cat_status= "Y" and a.examcat_type= "C" and a.exaid=?
               and b.exam_status='Y'
               group by a.exa_cat_id order by a.exa_cat_id`,
                { replacements: [master_id] }
            );

            const [subcategory] = await db.sequelize.query(
                /*
                    `select b.*
                from  tbl__exam_category as a
                inner join tbl__exam_category as b on 
                a.exa_cat_id=b.exaid_sub and a.exaid=? and b.examcat_type='S' 
                and b.exa_cat_status='Y'
                where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
                order by b.exa_cat_id`,
                */
                `select d.package_status, b.*
            from  tbl__exam_category as a
            inner join tbl__exam_category as b on 
            a.exa_cat_id=b.exaid_sub and a.exaid=? and b.examcat_type='S' 
            and b.exa_cat_status='Y'
            inner join tbl__exam as c on b.exa_cat_id=c.exam_sub_sub 
            LEFT JOIN tbl__exampackage as d on d.sub_cat = b.exa_cat_id and d.package_status = 'Y' and d.chapt_id = 0
            where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
            group by c.exam_sub_sub
            order by b.exa_cat_id`,
                { replacements: [master_id, master_id] }
            );

            const [chapters] = await db.sequelize.query(
                /* `select c.*
             from  tbl__exam_category as a
             inner join tbl__exam_category as b on a.exa_cat_id=b.exaid_sub and
              a.exaid=? and b.examcat_type='S' and b.exa_cat_status='Y'
             inner join tbl__examchapters as c on b.exa_cat_id=c.exa_cat_id
              and c.chapter_status='Y'
             where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
             order by c.chapt_id`,*/
                `select c.*, d.payment_flag 
            from  tbl__exam_category as a
            inner join tbl__exam_category as b on a.exa_cat_id=b.exaid_sub and
             a.exaid=? and b.examcat_type='S' and b.exa_cat_status='Y'
            inner join tbl__examchapters as c on b.exa_cat_id=c.exa_cat_id and c.chapter_status = 'Y' 
            inner join tbl__exam as d on c.chapt_id=d.exam_type_id   and d.exam_type_cat='C' and d.exam_status='Y'
            where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
            group by d.exam_type_id
            order by c.chapt_id`,
                { replacements: [master_id, master_id] }
            );

            /*
               const [chapters] = await db.sequelize.query(
                `select a.* from  tbl__examchapters as a 
            inner join tbl__exam b on a.exmain_cat=b.exam_cat 
            and b.exam_type_cat ='C' and a.chapt_id=b.exam_type_id
            where a.chapter_status='Y' and a.exmain_cat=?
            and b.exam_status='Y' group by a.chapt_id
            order by a.chapt_id`,
                { replacements: [master_id] }
            );
            */

            const [types] = await db.sequelize.query(
                `select c.*
            from  tbl__exam_category as a
            inner join tbl__exam_category as b on a.exa_cat_id=b.exaid_sub 
            and a.exaid=? and b.examcat_type='S' and b.exa_cat_status='Y'
            inner join tbl__examtypes as c on b.exa_cat_id=c.exa_cat_id and
             c.extype_status='Y'
             inner join tbl__exam as d on c.extype_id=d.exam_type_id   and d.exam_type_cat='T' and d.exam_status='Y'
            where a.exaid=? and a.examcat_type='C' and a.exa_cat_status='Y'
            group by d.exam_type_id
            order by c.extype_id`,
                { replacements: [master_id, master_id] }
            );
            /*
            const [types] = await db.sequelize.query(
                    `select a.* from  tbl__examtypes as a 
                    inner join tbl__exam b on a.exmain_cat=b.exam_cat 
                    and b.exam_type_cat ='T' and a.extype_id=b.exam_type_id
                    where a.extype_status='Y' and a.exmain_cat=?
                    and b.exam_status='Y' group by a.extype_id
                    order by a.extype_id`,
                    { replacements: [master_id] }
                );
            */
            const [exams] = await db.sequelize.query(
                `select * from tbl__exam as a 
                INNER JOIN tbl__examchapters as b on b.chapt_id = a.exam_type_id and b.chapter_status = 'Y' 
                where exam_cat = ? and exam_status = 'Y'`,
                { replacements: [master_id] }
            );
            res.send({
                category: category,
                subcategory: subcategory,
                chapters: chapters,
                types: types,
                exams: exams
            });
        } catch (error) {
            logger.error(`Error at All Category User: ${error.message}`);
            next(error);
        }
    },

    // Get Chapter List User
    getChapterList: async (req, res, next) => {
        try {
            let { sub_id } = req.params;

            const [chapters] = req && req.user ? 
            await db.sequelize.query(
                `select d.package_status, c.payment_status,a.*,b.* 
                from tbl__examchapters as a 
                inner join tbl__exam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
                LEFT JOIN tbl__orderitems as c on c.exam_id = b.exam_id and c.student_id = ? 
                LEFT JOIN tbl__exampackage as d on d.chapt_id = a.chapt_id AND d.package_status = 'Y'
                where  a.exa_cat_id=? and a.chapter_status = 'Y' 
                group by a.chapt_id,b.assign_test_type
                order by a.chapt_id,b.exam_id`,
                { replacements: [req.user.id, sub_id] }
            ) : 
            await db.sequelize.query(
                `select d.package_status,a.*,b.* 
                from tbl__examchapters as a 
                inner join tbl__exam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
                LEFT JOIN tbl__exampackage as d on d.chapt_id = a.chapt_id AND d.package_status = 'Y'
                where  a.exa_cat_id=? and a.chapter_status = 'Y' 
                group by a.chapt_id,b.assign_test_type
                order by a.chapt_id,b.exam_id`,
                { replacements: [sub_id] }
            )

            const [chapterlist] = req && req.user ?  
                await db.sequelize.query(
                    `select e.payment_status,a.*,b.*,c.exa_cat_name as 'Category',d.exa_cat_name as 'Subcategory'
                    from tbl__examchapters as a 
                    left join tbl__exam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
                    LEFT JOIN tbl__orderitems as e on e.exam_id = b.exam_id and e.student_id = ? and e.payment_status = 1
                    inner join tbl__exam_category as c on a.exsub_cat=c.exa_cat_id
                    inner join tbl__exam_category as d on a.exa_cat_id=d.exa_cat_id
                    where  a.exa_cat_id=? AND a.chapter_status = 'Y' 
                    order by b.exam_name`,
                    { replacements: [req.user.id, sub_id] }
                ) :
                await db.sequelize.query(
                    `select a.*,b.*,c.exa_cat_name as 'Category',d.exa_cat_name as 'Subcategory'
                    from tbl__examchapters as a 
                    left join tbl__exam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
                    inner join tbl__exam_category as c on a.exsub_cat=c.exa_cat_id
                    inner join tbl__exam_category as d on a.exa_cat_id=d.exa_cat_id
                    where  a.exa_cat_id=? AND a.chapter_status = 'Y' 
                    order by b.exam_name`,
                    { replacements: [sub_id] }
                )
            res.send({ count: chapterlist.length, chapters, chapterlist });
        } catch (error) {
            next(error);
        }
    },

    // Get Chapterwise User
    getChapterWise: async (req, res, next) => {
        try {
            let { chapter_id } = req.params;

            const [chapterwiselist] = await db.sequelize.query(
                `select a.*,b.exa_cat_name as 'Category',c.exa_cat_name as 'Subcategory',
                d.chapter_name as 'Chaptername' from tbl__exam as a
                inner join tbl__exam_category as b on a.exam_sub=b.exa_cat_id
                inner join tbl__exam_category as c on a.exam_sub_sub=c.exa_cat_id
                inner join tbl__examchapters as d on a.exam_type_id=d.chapt_id
                where a.exam_type_cat='C' and a.exam_status='Y' and a.exam_type_id=?`,
                { replacements: [chapter_id] }
            );
            res.send({ count: chapterwiselist.length, chapterwiselist });
        } catch (error) {
            next(error);
        }
    },

    //  Get Typewise User
    getTypeWise: async (req, res, next) => {
        try {
            let { types_id } = req.params;
            const [typewiselist] = req && req.user ? 
                await db.sequelize.query(
                    `select e.payment_status,a.*,b.exa_cat_name as 'Category',c.exa_cat_name as
                    'Subcategory',d.extest_type as 'Chaptername' from tbl__exam as a
                    inner join tbl__exam_category as b on a.exam_sub=b.exa_cat_id
                    inner join tbl__exam_category as c on a.exam_sub_sub=c.exa_cat_id
                    inner join tbl__examtypes as d on a.exam_type_id=extype_id
                    left join tbl__orderitems as e on e.exam_id = a.exam_id and e.student_id = ?
                    where a.exam_type_cat='T' and a.exam_status='Y' and a.exam_type_id=?`,
                    { replacements: [req.user.id, types_id] }
                ) : 
                await db.sequelize.query(
                    `select a.*,b.exa_cat_name as 'Category',c.exa_cat_name as
                    'Subcategory',d.extest_type as 'Chaptername' from tbl__exam as a
                    inner join tbl__exam_category as b on a.exam_sub=b.exa_cat_id
                    inner join tbl__exam_category as c on a.exam_sub_sub=c.exa_cat_id
                    inner join tbl__examtypes as d on a.exam_type_id=extype_id
                    where a.exam_type_cat='T' and a.exam_status='Y' and a.exam_type_id=?`,
                    { replacements: [types_id] }
                ) 
            res.send({ count: typewiselist.length, typewiselist });
        } catch (error) {
            next(error);
        }
    },

    getChapterWiseList: async (req, res, next) => {
        try {
            let { chapter_id } = req.params;
            const [chapterlist] = req && req.user ? await db.sequelize.query(
                `select e.payment_status, a.*,b.exa_cat_name as 'Category',c.exa_cat_name as
                 'Subcategory',d.chapter_name as 'Chaptername', d.chapt_id from tbl__exam as a
                inner join tbl__exam_category as b on a.exam_sub=b.exa_cat_id
                inner join tbl__exam_category as c on a.exam_sub_sub=c.exa_cat_id
                inner join tbl__examchapters as d on a.exam_type_id=d.chapt_id 
                left JOIN tbl__orderitems as e on e.exam_id = a.exam_id and e.student_id = ? and e.payment_status = 1
                where a.exam_type='C' and a.exam_status='Y' 
                and a.exam_type_id=? and a.assign_test_type='M' order by a.exam_id`,
                { replacements: [req.user.id, chapter_id] }
            ) : await db.sequelize.query(
                `select e.payment_status, a.*,b.exa_cat_name as 'Category',c.exa_cat_name as
                 'Subcategory',d.chapter_name as 'Chaptername', d.chapt_id from tbl__exam as a
                inner join tbl__exam_category as b on a.exam_sub=b.exa_cat_id
                inner join tbl__exam_category as c on a.exam_sub_sub=c.exa_cat_id
                inner join tbl__examchapters as d on a.exam_type_id=d.chapt_id 
                left JOIN tbl__orderitems as e on e.exam_id = a.exam_id and e.payment_status = 1
                where a.exam_type='C' and a.exam_status='Y' 
                and a.exam_type_id=? and a.assign_test_type='M' order by a.exam_id`,
                { replacements: [chapter_id] }
            )
            
            res.send({ count: chapterlist.length, chapterlist });
        } catch (error) {
            next(error);
        }
    },

    // Get Home Category User
    getHomeCategory: async (req, res, next) => {
        try {
            const { count, rows } = await db.HomeCategory.findAndCountAll({
                where: { exa_cat_status: "Y" },
                order: [["exa_cat_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Master category not found.");
            }
            res.send({ count, homecategory: rows });
        } catch (error) {
            next(error);
        }
    },

    getTopicWiseTest: async (req, res, next) => {
        try {
            let { sub_id } = req.params;
            const [chapterlist] = await db.sequelize.query(
                `select a.*,b.*,c.exa_cat_name as 'Category',d.exa_cat_name as 'Subcategory'
            from tbl__examchapters as a 
            left join tbl__exam as b on b.exam_type_id=a.chapt_id and b.exam_type_cat='C' and b.exam_status='Y'
            inner join tbl__exam_category as c on a.exsub_cat=c.exa_cat_id
            inner join tbl__exam_category as d on a.exa_cat_id=d.exa_cat_id
            where  a.exa_cat_id=?`,
                { replacements: [sub_id] }
            );
            let chapterWiselist = chapterlist.reduce((r, a) => {
                r[a.chapt_id] = [...(r[a.chapt_id] || []), a];
                return r;
            }, {});
            res.send({ count: chapterWiselist.length, chapterlist: chapterWiselist });
        } catch (error) {
            next(error);
        }
    },

    getAllCategory: async (req, res, next) => {
        try {
            /*const [category] = await db.sequelize.query(
                `select * from tbl__exam_category as a 
               inner join tbl__exam as b on a.exa_cat_id=b.exam_cat
               where a.exa_cat_status= "Y" and a.examcat_type= "M" 
               and b.exam_status='Y'
               group by a.exa_cat_id order by exa_cat_pos`
            );

            const [subcategory] = await db.sequelize.query(
                `select b.*
            from  tbl__exam_category as a
            inner join tbl__exam_category as b on 
            a.exa_cat_id=b.exaid and b.examcat_type='C' 
            and b.exa_cat_status='Y' 
            order by b.exa_cat_id`
            );*/
            const [category] = await db.sequelize.query(
                `select a.exa_cat_id, a.exa_cat_name as homecategory, a.exa_cat_image as homecatImage from tbl__home_category as a 
                INNER JOIN tbl__home_master_category as b on b.homecategoryid = a.exa_cat_id 
                where a.exa_cat_status = 'Y' ORDER BY a.exa_cat_pos`
            );
            /*const [subcategory] = await db.sequelize.query(
                `SELECT b.payment_flag, b.exa_cat_id, b.exa_cat_image, GROUP_CONCAT(b.exa_cat_name ORDER BY b.exa_cat_pos) examcategoryname, 
                c.exa_cat_id as homecatid, c.exa_cat_name as homecategory from tbl__home_master_category as a 
                INNER JOIN tbl__exam_category as b on FIND_IN_SET(b.exa_cat_id, a.exa_cat_id) > 0 
                INNER JOIN tbl__home_category as c on a.homecategoryid = c.exa_cat_id
                GROUP BY a.homecategoryid, b.exa_cat_id ORDER BY a.homecategoryid,c.exa_cat_name,b.exa_cat_pos`
            );*/

            const [subcategory] = await db.sequelize.query(
                `SELECT b.payment_flag, d.package_status, b.exa_cat_id, b.exa_cat_image, b.exa_cat_name as examcategoryname, 
                c.exa_cat_id as homecatid, c.exa_cat_name as homecategory from tbl__home_master_category as a 
                INNER JOIN tbl__exam_category as b on FIND_IN_SET(b.exa_cat_id, a.exa_cat_id) > 0 
                INNER JOIN tbl__home_category as c on a.homecategoryid = c.exa_cat_id
                left JOIN tbl__exampackage as d on d.master_cat = b.exa_cat_id and d.package_status = 'Y' and d.main_cat =0 and d.sub_cat=0
                GROUP BY a.homecategoryid, b.exa_cat_id ORDER BY a.homecategoryid,c.exa_cat_name,b.exa_cat_pos`
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

    getAllExamCategory: async (req, res, next) => {
        try {
            const [category] = await db.sequelize.query(
                `select * from tbl__exam_category as a 
               inner join tbl__exam as b on a.exa_cat_id=b.exam_cat
               where a.exa_cat_status= "Y" and a.examcat_type= "M" 
               and b.exam_status='Y'
               group by a.exa_cat_id order by exa_cat_pos`
            );

            const [subcategory] = await db.sequelize.query(
                `select b.*
            from  tbl__exam_category as a
            inner join tbl__exam_category as b on 
            a.exa_cat_id=b.exaid and b.examcat_type='C' 
            and b.exa_cat_status='Y' 
            order by b.exa_cat_id`
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

    getAllPaidTest: async (req, res, next) => {
        try {
            let { subid } = req.params;
            const { count, rows } = await db.Exams.findAndCountAll({
                where: { exam_type_cat: "C", exam_sub_sub: subid, exam_status: 'Y', payment_flag: 'Y' }
            });

            if (!rows) {
                throw createError.NotFound("Master category not found.");
            }
            res.send({ count, paidtest: rows });
        } catch (error) {
            next(error);
        }
    },

    getDurationById: async (req, res, next) => {
        try {
            let { master_cat, main_cat, sub_cat, chapt_id } = req.body;
            console.log(req.body);
            if (!chapt_id) {
                const [duration] = await db.sequelize.query(
                    `SELECT a.*, b.package_duration_id from tbl__duration as a 
                INNER JOIN tbl__exampackage_duration as b on b.duration_ref_id = a.duration_id 
                INNER JOIN tbl__exampackage as c on c.package_id = b.exam_package_ref_id 
                WHERE c.master_cat = ? and c.main_cat = ? and c.sub_cat = ? and c.chapt_id = 0 AND c.package_status = 'Y'`,
                    { replacements: [master_cat, main_cat, sub_cat] }
                );
                res.send({ durations: duration });
            }
            if (chapt_id) {
                const [duration] = await db.sequelize.query(
                    `SELECT a.*, b.package_duration_id from tbl__duration as a 
                INNER JOIN tbl__exampackage_duration as b on b.duration_ref_id = a.duration_id 
                INNER JOIN tbl__exampackage as c on c.package_id = b.exam_package_ref_id 
                WHERE c.master_cat = ? and c.main_cat = ? and c.sub_cat = ? and c.chapt_id = ? AND c.package_status = 'Y'`,
                    { replacements: [master_cat, main_cat, sub_cat, chapt_id] }
                );
                res.send({ durations: duration });
            }
        } catch (error) {
            next(error);
        }
    },

    getPriceByDuration: async (req, res, next) => {
        try {
            let { packageId } = req.params;
            const { count, rows } = await db.ExamPackageDuration.findAndCountAll({
                where: { package_duration_id: packageId }
            });

            if (!rows) {
                throw createError.NotFound("Price not found.");
            }
            res.send({ count, price: rows });
        } catch (error) {
            next(error);
        }
    },

    getAllPayments: async (req, res, next) => {
        try {
            const { count, rows } = await db.OrderItems.findAndCountAll({
                where: { payment_status: 1, student_id: req.user.id }
            });

            if (!rows) {
                throw createError.NotFound("Error.");
            }
            res.send({ count, payments: rows });
        } catch (error) {
            next(error);
        }
    },

    getSubPaidStatus: async (req, res, next) => {
        try {
            let { subid } = req.params;
            const [payments] = await db.sequelize.query(
                `SELECT payment_status from tbl__orderitems WHERE exam_id = ? 
                AND payment_status = 1 and student_id = ?`,
                { replacements: [subid, req.user.id] }
            );
            res.send({ count: payments.length });
        } catch (error) {
            next(error);
        }
    },

    getChapterPaidStatus: async (req, res, next) => {
        try {
            let { chapid } = req.params;
            const [payments] = await db.sequelize.query(
                `SELECT payment_status from tbl__orderitems WHERE exam_id = ? 
                AND payment_status = 1 and student_id = ?`,
                { replacements: [chapid, req.user.id] }
            );
            res.send({ count: payments.length });
        } catch (error) {
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
