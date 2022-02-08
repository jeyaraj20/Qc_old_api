const db = require("../Models");
const _ = require('underscore');
const logger = require("../helper/schoolLogger");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    getQcMasterCategory: async (req, res, next) => {
        try {
            let [masterCategory] = await db.sequelize.query(
                `SELECT
                    b.* 
                FROM 
                    tbl__school_questioncloud_exam as a 
                    INNER JOIN tbl__exam_category as b on a.masterCategory=b.exa_cat_id and b.exa_cat_status='Y' 
                WHERE 
                    a.schoolRefId=${req.user.schoolid} AND a.activeStatus='Y' AND 
                    b.exaid='0' AND exa_cat_status ='Y' AND examcat_type='M'
                group by 
                    a.masterCategory`
            );
            res.send({ statusCode: 200, message: 'QC Master Category Fetched Successfully.', masterCategory });
        } catch (error) {
            logger.error(`Error at Get QC Master Category - School : ${error.message}`);
            res.send({ statusCode: 500, message: 'Somthing Wrong' });
        }
    },

    getQcMainCategory: async (req, res, next) => {
        try {
            let { masterIds } = req.query;
            let where = `a.schoolRefId=${req.user.schoolid} AND a.activeStatus='Y'`;
            if (masterIds && masterIds.length > 0) {
                where += ` AND a.masterCategory IN (${masterIds.join()})`
            }
            let mainCategory = [];
            let [masterCategory] = await db.sequelize.query(
                `SELECT
                    *
                FROM 
                    tbl__school_questioncloud_exam as a 
                WHERE 
                    ${where}
                group by 
                    a.masterCategory`
            );

            await asyncForEach(masterCategory, async (oneDoc, index) => {
                if (oneDoc.mainCategory) {
                    let [result] = await db.sequelize.query(
                        `SELECT
                            a.*,
                            b.exa_cat_name AS masterName
                        FROM 
                            tbl__exam_category as a 
                            INNER JOIN tbl__exam_category as b on b.exa_cat_id=a.exaid and b.exa_cat_status='Y' 
                        WHERE 
                            a.exa_cat_id=${oneDoc.mainCategory} AND a.exa_cat_status='Y' `
                    );
                    mainCategory.push(result);
                } else {
                    let [result] = await db.sequelize.query(
                        `SELECT
                            a.*,
                            b.exa_cat_name AS masterName
                        FROM 
                            tbl__exam_category as a 
                            INNER JOIN tbl__exam_category as b on b.exa_cat_id=a.exaid and b.exa_cat_status='Y' 
                        WHERE 
                            a.exaid=${oneDoc.masterCategory} AND a.examcat_type='C' AND a.exa_cat_status='Y'`
                    );
                    mainCategory.push(result);
                }
            });

            mainCategory = _.flatten(mainCategory);
            res.send({ statusCode: 200, message: 'QC Main Category Fetched Successfully.', mainCategory });
        } catch (error) {
            logger.error(`Error at Get QC Main Category - School : ${error.message}`);
            res.send({ statusCode: 500, message: 'Somthing Wrong' });
        }
    },

    // 2. Get Category By Id
    getQcSubCategory: async (req, res, next) => {
        try {
            let { mainIds } = req.query;
            let subCategory = [];
            if (mainIds && mainIds.length > 0) {
                await asyncForEach(mainIds, async (oneDoc, index) => {
                    let [subCategoryIdArray] = await db.sequelize.query(
                        `SELECT
                            a.subCategory
                        FROM 
                            tbl__school_questioncloud_exam as a 
                        WHERE 
                            a.schoolRefId=${req.user.schoolid} AND a.activeStatus='Y' AND a.mainCategory IN (${oneDoc})
                        `
                    );

                    subCategoryIdArray = subCategoryIdArray && subCategoryIdArray.length > 0 ? subCategoryIdArray.map(s => s.subCategory) : [];
                    subCategoryIdArray = _.compact(subCategoryIdArray);

                    if (subCategoryIdArray && subCategoryIdArray.length > 0) {
                        let subCategoryIds = subCategoryIdArray.map(s => {
                            if (s.includes(',')) {
                                return s.split(',');
                            } else {
                                return s;
                            }
                        });
                        subCategoryIds = _.flatten(subCategoryIds);

                        let [result] = await db.sequelize.query(
                            `SELECT
                                a.*,
                                b.exa_cat_name AS masterName,
                                c.exa_cat_name AS mainName
                            FROM 
                                tbl__exam_category AS a
                                INNER JOIN tbl__exam_category as b on b.exa_cat_id=a.exaid
                                INNER JOIN tbl__exam_category as c on c.exa_cat_id=a.exaid_sub
                            WHERE 
                                a.exa_cat_id IN (${subCategoryIds}) AND a.exa_cat_status='Y'
                            group by 
                                exa_cat_id`
                        );
                        subCategory.push(result);
                    } else {
                        let [result] = await db.sequelize.query(
                            `SELECT
                                a.*,
                                b.exa_cat_name AS masterName,
                                c.exa_cat_name AS mainName
                            FROM 
                                tbl__exam_category AS a
                                INNER JOIN tbl__exam_category as b on b.exa_cat_id=a.exaid
                                INNER JOIN tbl__exam_category as c on c.exa_cat_id=a.exaid_sub
                            WHERE 
                                a.exaid_sub IN (${oneDoc}) AND a.exa_cat_status='Y'
                            group by 
                                exa_cat_id`
                        );
                        subCategory.push(result);
                    }
                });
            }

            subCategory = _.flatten(subCategory);
            res.send({ statusCode: 200, message: 'QC Sub Category Fetched Successfully.', subCategory });
        } catch (error) {
            logger.error(`Error at Get QC Sub Category - School : ${error.message}`);
            res.send({ statusCode: 500, message: 'Somthing Wrong' });
        }
    },

    // 3. Get Category By Position
    getQcChapters: async (req, res, next) => {
        try {
            let { subIds } = req.query;
            let chapterIds = [];
            if (subIds && subIds.length > 0) {
                await asyncForEach(subIds, async (oneDoc, index) => {
                    let [chapterId] = await db.sequelize.query(
                        `SELECT
                            *
                        FROM 
                            tbl__school_questioncloud_exam as a 
                        WHERE 
                            a.schoolRefId=${req.user.schoolid} AND a.activeStatus='Y' AND a.subCategory LIKE '%${oneDoc}%'
                        `
                    );
                    if (chapterId && chapterId[0] && chapterId[0].chapterIds) {
                        if (chapterId[0].chapterIds.includes(',')) {
                            chapterIds.push(chapterId[0].chapterIds.split(','));
                        } else {
                            chapterIds.push(chapterId[0].chapterIds);
                        }
                    } else {
                        let [result] = await db.sequelize.query(
                            `SELECT
                                a.*
                            FROM 
                                tbl__examchapters AS a
                            WHERE 
                                a.exa_cat_id=(${oneDoc}) AND a.chapter_status='Y'
                            group by 
                                chapt_id`
                        );
                        result = result.map(r => r.chapt_id);
                        chapterIds.push(result);
                    }
                });

                chapterIds = _.flatten(chapterIds);
                let chapters = [];
                if (chapterIds && chapterIds.length > 0) {
                    let [result] = await db.sequelize.query(
                        `SELECT
                            a.*,
                            b.exa_cat_name AS masterName,
                            c.exa_cat_name AS mainName,
                            d.exa_cat_name AS subName
                        FROM 
                            tbl__examchapters AS a
                            INNER JOIN tbl__exam_category as b on b.exa_cat_id=a.exmain_cat
                            INNER JOIN tbl__exam_category as c on c.exa_cat_id=a.exsub_cat
                            INNER JOIN tbl__exam_category as d on d.exa_cat_id=a.exa_cat_id
                        WHERE 
                            a.chapt_id IN (${chapterIds}) AND a.chapter_status='Y'
                        group by 
                            chapt_id`
                    );
                    chapters = result;
                } else {
                    let [result] = await db.sequelize.query(
                        `SELECT
                            a.*,
                            b.exa_cat_name AS masterName,
                            c.exa_cat_name AS mainName,
                            d.exa_cat_name AS subName
                        FROM 
                            tbl__examchapters AS a
                            INNER JOIN tbl__exam_category as b on b.exa_cat_id=a.exmain_cat
                            INNER JOIN tbl__exam_category as c on c.exa_cat_id=a.exsub_cat
                            INNER JOIN tbl__exam_category as d on d.exa_cat_id=a.exa_cat_id
                        WHERE 
                            a.exa_cat_id IN (${subIds.join(',')}) AND a.chapter_status='Y'
                        group by 
                            chapt_id`
                    );
                    chapters = result;
                }
                res.send({ statusCode: 200, message: 'QC Sub Category Fetched Successfully.', chapters });
            } else {
                res.send({ statusCode: 406, message: 'Bad Request' });
            }
        } catch (error) {
            logger.error(`Error at Get QC Sub Category - School : ${error.message}`);
            res.send({ statusCode: 500, message: 'Somthing Wrong' });
        }
    }
};
