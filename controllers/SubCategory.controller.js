const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const { Op } = require("sequelize");
const logger = require('../helper/adminLogger');
const { decode } = require('html-entities');
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars');
const pdf = require('html-pdf');
const puppeteer = require('puppeteer');

const Question_sub_category_html = fs.readFileSync(path.resolve(__dirname, '../templates/report_table.html'), 'utf8');
const template = handlebars.compile(Question_sub_category_html);
const templatesPath = path.resolve(__dirname, "..", "templates");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    // 0. Question PDF
    getQuestionPDFreport: async function (req, res) {

        try {
            const { maincat, subcat, isSchoolAdmin, isQcAdmin } = req.body;
            let questions = [];

            if (isQcAdmin) {
                let [result] = await db.sequelize.query(
                    `SELECT 
                        C.cat_name as maincatname, 
                        SC.cat_name as subcatname, 
                        que.* 
                    FROM 
                        tbl__question as que
                        INNER JOIN tbl__category AS C ON C.cat_id = que.cat_id 
                        INNER JOIN tbl__category AS SC ON SC.cat_id = que.sub_id 
                    where 
                        que.sub_id = ${subcat} and que.cat_id = ${maincat} and que.quest_status != 'D'`
                );
                questions = result;
            }


            if (isSchoolAdmin) {
                let [result] = await db.sequelize.query(
                    `SELECT 
                        C.cat_name as maincatname, 
                        SC.cat_name as subcatname, 
                        S.schoolName AS schoolName,
                        que.* 
                    FROM 
                        tbl__schoolquestion as que
                        INNER JOIN tbl__school_question_category AS C ON C.cat_id = que.cat_id 
                        INNER JOIN tbl__school_question_category AS SC ON SC.cat_id = que.sub_id 
                        INNER JOIN tbl__school AS S ON S.id = que.schoolid
                    where 
                        que.sub_id = ${subcat} and que.cat_id = ${maincat} and que.quest_status != 'D'`
                );
                questions = result;
            }

            await asyncForEach(questions, async (oneDoc, index) => {
                oneDoc.index = index;
                oneDoc.rowNo = index + 1;

                if (oneDoc.question && oneDoc.q_type === "T") {
                    oneDoc.question = decode(oneDoc.question);
                } else if (oneDoc.question && oneDoc.q_type !== "T" && isQcAdmin) {
                    oneDoc.question = `<img src={'https://questioncloud.in/uploads/question/${oneDoc.question}'} />`;
                } else if (oneDoc.question && oneDoc.q_type !== "T" && isSchoolAdmin) {
                    oneDoc.question = `<img src={'https://questioncloud.in/uploads/schoolquestions/${oneDoc.question}'} />`;
                }

                if (oneDoc.opt_1 && oneDoc.opt_type1 === "T") {
                    oneDoc.opt_1 = decode(oneDoc.opt_1);
                } else if (oneDoc.opt_1 && oneDoc.opt_type1 !== "T" && isQcAdmin) {
                    oneDoc.opt_1 = `<img src={'https://questioncloud.in/uploads/question/${oneDoc.opt_1}'} />`;
                } else if (oneDoc.opt_1 && oneDoc.opt_type1 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_1 = `<img src={'https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_1}'} />`;
                }

                if (oneDoc.opt_2 && oneDoc.opt_type2 === "T") {
                    oneDoc.opt_2 = decode(oneDoc.opt_2);
                } else if (oneDoc.opt_2 && oneDoc.opt_type2 !== "T" && isQcAdmin) {
                    oneDoc.opt_2 = `<img src={'https://questioncloud.in/uploads/question/${oneDoc.opt_2}'} />`;
                } else if (oneDoc.opt_1 && oneDoc.opt_type2 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_2 = `<img src={'https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_2}'} />`;
                }

                if (oneDoc.opt_3 && oneDoc.opt_type3 === "T") {
                    oneDoc.opt_3 = decode(oneDoc.opt_3);
                } else if (oneDoc.opt_3 && oneDoc.opt_type3 !== "T" && isQcAdmin) {
                    oneDoc.opt_3 = `<img src={'https://questioncloud.in/uploads/question/${oneDoc.opt_3}'} />`;
                } else if (oneDoc.opt_3 && oneDoc.opt_type3 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_3 = `<img src={'https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_3}'} />`;
                }

                if (oneDoc.opt_4 && oneDoc.opt_type4 === "T") {
                    oneDoc.opt_4 = decode(oneDoc.opt_4);
                } else if (oneDoc.opt_4 && oneDoc.opt_type4 !== "T" && isQcAdmin) {
                    oneDoc.opt_4 = `<img src={'https://questioncloud.in/uploads/question/${oneDoc.opt_4}'} />`;
                } else if (oneDoc.opt_4 && oneDoc.opt_type4 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_4 = `<img src={'https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_4}'} />`;
                }

                if (oneDoc.opt_5 && oneDoc.opt_type5 === "T") {
                    oneDoc.opt_5 = decode(oneDoc.opt_5);
                } else if (oneDoc.opt_5 && oneDoc.opt_type5 !== "T" && isQcAdmin) {
                    oneDoc.opt_5 = `<img src={'https://questioncloud.in/uploads/question/${oneDoc.opt_5}'} />`;
                } else if (oneDoc.opt_5 && oneDoc.opt_type5 !== "T" && isSchoolAdmin) {
                    oneDoc.opt_5 = `<img src={'https://questioncloud.in/uploads/schoolquestions/${oneDoc.opt_5}'} />`;
                }

            });

            const html = template({
                data: questions,
                mainCatName: questions[0].maincatname,
                subCatName: questions[0].subcatname,
                headerName: isQcAdmin ? 'Question Cloud' : questions[0].schoolName,
                rowCount: questions.length
            });

            // const browser = await puppeteer.launch();
            const browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium-browser',
                args: ['--no-sandbox', '--disable-dev-shm-usage'],
            });
            const page = await browser.newPage();
            await page.setContent(html);
            await page.pdf({ path: path.resolve(templatesPath, `reports.pdf`), format: 'A4' });
            await browser.close();
            console.log("PDF Generated");
            await path.resolve(templatesPath, `reports.pdf`);
            fs.readFile(path.join(templatesPath, 'reports.pdf'), function (err, data2) {
                res.header('Content-Type', 'application/pdf');
                res.header('Content-Transfer-Encoding', 'Binary');
                res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
                res.send(data2);
            });
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory : ${error.message}`);
            next(error);
        }
    },

    // 1. Get All Active SubCategory
    getAllActiveSubCategory: async (req, res, next) => {
        try {
            let { status } = req.params;

            let { rows, count } = await db.Category.findAndCountAll({
                attributes: ["cat_id", "pid", "cat_name", "cat_slug",
                    "cat_code", "cat_desc", "cat_pos"
                ],
                where: {
                    cat_status: status,
                    pid: {
                        [Op.ne]: 0
                    },
                },
                order: [
                    ["cat_pos"]
                ]
            });

            if (!rows) res.send({ category: "Sub Category Not Found !!!" });


            let category = await db.Category.findAll({
                attributes: ["cat_id", "cat_name"],
                where: {
                    pid: 0
                },
            });


            const [waitingquestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as waitingcount
                FROM tbl__question where quest_status='W'
                GROUP BY sub_id`, { replacements: [] }
            );

            const [activequestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as activecount
                    FROM tbl__question where quest_status='Y'
                    GROUP BY sub_id`, { replacements: [] }
            );

            /*
                        const [category, metadata] = await db.sequelize.query(
                            `
                            SELECT 
                                    b.cat_name AS 'MainCategory', a.*, '0' as 'qWaitingCount' , '0' as 'qActiveCount'
                            FROM
                                    tbl__category a
                            INNER JOIN tbl__category b ON 
                                    a.pid = b.cat_id
                            WHERE
                                    a.cat_status = ?
                            `,
                            { replacements: [status] }
                        );
            */
            res.send({
                count,
                subcategory: rows,
                category: category,
                waitingquestioncount: waitingquestioncount,
                activequestioncount: activequestioncount
            });
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory : ${error.message}`);
            next(error);
        }
    },

    // Get All Active SubCategory Only
    getAllActiveSubCategoryAlone: async (req, res, next) => {
        try {
            let { status } = req.params;

            let { rows } = await db.Category.findAndCountAll({
                attributes: ["cat_id", "pid", "cat_name", "cat_slug",
                    "cat_code", "cat_desc"
                ],
                where: {
                    cat_status: status,
                    pid: {
                        [Op.ne]: 0
                    },
                },
                order: [
                    ["cat_pos"]
                ]
            });

            if (!rows) res.send({ category: "Sub Category Not Found !!!" });

            let category = await db.Category.findAll({
                attributes: ["cat_id", "cat_name"],
                where: {
                    cat_status: status,
                    pid: 0
                },
            });


            res.send({
                subcategory: rows,
                category: category
            });
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory : ${error.message}`);
            next(error);
        }
    },

    // 2. Create SubCategory By Id
    createSubCategoryById: async (req, res, next) => {
        try {
            const { cat_name, cat_code, cat_desc, pid } = req.body;
            if (!cat_name || !cat_code || !cat_desc || !pid) throw createError.BadRequest();

            const [category, created] = await db.Category.findOrCreate({
                where: { cat_name, cat_code },
                defaults: {
                    cat_name,
                    cat_code,
                    cat_desc,
                    pid,
                    cat_pos: 0,
                    cat_slug: "",
                    cat_image: "",
                    cat_status: "Y",
                    cat_dt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
            });

            if (!created)
                throw createError.Conflict(
                    `Categrory - '${cat_name}' with Code - '${cat_code}' Already Exists !!!`
                );
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Create SubCategory By Id : ${error.message}`);
            next(error);
        }
    },

    // 3. Get Category By Id
    getSubCategoryById: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();

            /*
            let category = await db.Category.findOne({
                where: {
                    cat_id: catId,
                    cat_status: "Y",
                },
            });
            */
            const [category, metadata] = await db.sequelize.query(
                `
                SELECT 
                    e.cat_name AS 'MainCategory',
                    m.cat_name AS 'SubCategory',
                    m.cat_code AS 'UniqueCode',
                    m.cat_desc AS 'Description',
                    m.cat_id AS 'Catid',
                    e.cat_id AS 'Pid'
                FROM
                    tbl__category e
                INNER JOIN tbl__category m ON 
                    m.pid = e.cat_id
                WHERE
		            e.cat_status = 'Y' and m.cat_status = 'Y' and m.cat_id = ${catId}
                `
            );

            if (!category) throw createError.NotFound("Category Not Found !!!");
            res.send({ category });
        } catch (error) {
            logger.error(`Error at Get Category By Id : ${error.message}`);
            next(error);
        }
    },

    // 4. Update Sub Category By Id
    updateSubCategoryById: async (req, res, next) => {
        try {
            let { pid } = req.params;
            const { cat_name, cat_code, cat_desc } = req.body;
            if (!cat_name || !cat_code || pid == 0) throw createError.BadRequest();

            const { count, rows } = await db.Category.findAndCountAll({
                where: { cat_name, cat_code },
            });
            /*if (count > 0)
                throw createError.Conflict(
                    `Categrory - '${cat_name}' with Code - '${cat_code}' Already Exists !!!`
                );*/

            await db.Category.update({
                cat_name,
                cat_code,
                cat_desc,
                cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            }, { where: { cat_id: pid } })
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Sub Category By Id : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Inactive'
    updateInactiveById: async (req, res, next) => {
        try {
            let { catId, status } = req.body;
            if (!catId || !status) throw createError.BadRequest();

            await db.Category.update({ cat_status: status }, { where: { cat_id: catId } })
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Sub Category Status : ${error.message}`);
            next(error);
        }
    },

    // 6. Update 'Delete'
    updateDeleteById: async (req, res, next) => {
        try {
            let { catId } = req.body;
            if (!catId) throw createError.BadRequest();

            await db.Category.update({ cat_status: "D" }, { where: { cat_id: catId } })
                .then((result) => res.sendStatus(204))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Delete Sub Category By Id : ${error.message}`);
            next(error);
        }
    },

    // 7. Get All Inactive SubCategory
    getAllInActiveSubCategory: async (req, res, next) => {
        try {
            const [category, metadata] = await db.sequelize.query(
                `
                SELECT 
                    e.cat_name AS 'MainCategory',
                    m.cat_name AS 'SubCategory',
                    m.cat_code AS 'UniqueCode',
                    m.cat_desc AS 'Description',
                    m.cat_id AS 'Catid',
                    e.cat_id AS 'Pid'
                FROM
                    tbl__category e
                INNER JOIN tbl__category m ON 
                    m.pid = e.cat_id
                WHERE
		            e.cat_status = 'Y' and m.cat_status = 'N'
                `
            );

            if (!category) {
                throw createError.NotFound("SubCategory Not Found !!!");
            }
            let count = category.length;
            res.send({ count, category });
        } catch (error) {
            logger.error(`Error at Get All Inactive SubCategory : ${error.message}`);
            next(error);
        }
    },

    // 7. Exam Sub Category Search Result
    getSearchResult: async (req, res, next) => {
        try {
            let { searchString, cat_id, subcat_id, status } = req.body;
            if (searchString == null || cat_id == null) throw createError.BadRequest();
            if (!!searchString) searchString = `%${searchString}%`;
            let conditions;
            if (!!searchString && !!cat_id) {
                conditions = `(cat_name LIKE '${searchString}' OR cat_code LIKE '${searchString}') AND pid = '${cat_id}'`;
            } else {
                conditions = `(cat_name LIKE '${searchString}' OR cat_code LIKE '${searchString}') OR pid = '${cat_id}'`;
            }

            if (subcat_id && subcat_id != 'M') {
                conditions = `(cat_name LIKE '${searchString}' OR cat_code LIKE '${searchString}') OR pid = '${cat_id}' and cat_id = '${subcat_id}'`;
            }

            const [subcategory] = await db.sequelize.query(
                `
                SELECT cat_id,pid,cat_name,cat_slug,cat_code,
                cat_desc,cat_pos
                FROM
                        tbl__category 
                WHERE
                        cat_status = ? AND ( ${conditions} ) and pid!=0
                `, { replacements: [status] }
            );

            if (!subcategory) res.send({ category: "Sub Category Not Found !!!" });

            let category = await db.Category.findAll({
                attributes: ["cat_id", "cat_name"],
                where: {
                    pid: 0
                },
            });


            const [waitingquestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as waitingcount
                FROM tbl__question where quest_status='W'
                GROUP BY sub_id`, { replacements: [] }
            );

            const [activequestioncount] = await db.sequelize.query(
                `SELECT sub_id, count('sub_id') as activecount
                    FROM tbl__question where quest_status='Y'
                    GROUP BY sub_id`, { replacements: [] }
            );


            res.send({
                count: subcategory.length,
                subcategory,
                category: category,
                waitingquestioncount: waitingquestioncount,
                activequestioncount: activequestioncount
            });
        } catch (error) {
            logger.error(`Error at Exam Sub Category Search Result : ${error.message}`);
            next(error);
        }
    },

    // 8. Get QBank Sub Category Count Only
    getSubCategoryCount: async (req, res, next) => {
        try {
            let { cat_status } = req.params;
            if (cat_status == null) throw createError.BadRequest();
            let count = 0;
            count = await db.Category.count({
                where: {
                    cat_status,
                    pid: {
                        [Op.ne]: 0
                    }
                },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get QBank Sub Category Count Only : ${error.message}`);
            next(error);
        }
    },


    // 3. Get Sub Category By CatId
    getSubCategoryByCatId: async (req, res, next) => {
        try {
            let { catId } = req.params;
            if (catId == 0) throw createError.BadRequest();
            const [subcategory] = await db.sequelize.query(
                `
                SELECT e.cat_id, e.cat_name FROM tbl__category e WHERE e.pid = ${catId} and e.cat_status = 'Y' ORDER BY trim(cat_name) ASC
                `
            );

            if (!subcategory) throw createError.NotFound("Sub Category Not Found !!!");
            res.send({ subcategory });
        } catch (error) {
            logger.error(`Error at Get Sub Category By CatId : ${error.message}`);
            next(error);
        }
    },

    getQuestionspdf: async (req, res, next) => {
        try {
            const {
                maincat,
                subcat
            } = req.body;
            console.log(maincat, subcat);
            const [subcategory] = await db.sequelize.query(
                `SELECT cat.cat_name as maincatname, catsub.cat_name as subcatname, que.* FROM tbl__question as que, tbl__category as cat, tbl__category as catsub where que.sub_id = ` + subcat + ` and que.cat_id = ` + maincat + ` and que.quest_status <> 'D'
                and cat.cat_id = que.cat_id and catsub.cat_id = que.sub_id`
            );
            res.send({ qdata: subcategory });
        } catch (error) {
            next(error);
        }
    },
    getExamQuestionspdf: async (req, res, next) => {
        try {
            const {
                maincat,
                subcat,
                subsubcat
            } = req.body;
            console.log(maincat, subcat);
            const [subcategory] = await db.sequelize.query(
                `select cat1.exa_cat_name as maincatname, cat2.exa_cat_name as subcatname, que.* from tbl__question as que, tbl__exam_category as cat1, tbl__exam_category as cat2 where cat1.exa_cat_id = ` + maincat + ` and cat2.exa_cat_id = ` + subcat + `
                and qid in
                (select qid from tbl__examquestions where exam_id in
                (SELECT exam_id FROM tbl__exam where exam_cat = ` + maincat + ` and exam_sub = ` + subcat + ` and exam_sub_sub = ` + subsubcat + `)
                and exam_queststatus <> 'D')`
            );
            res.send({ qdata: subcategory });
        } catch (error) {
            next(error);
        }
    },

    updatePositionById: async (req, res, next) => {
        try {
            const { values } = req.body;
            if (!values) throw createError.BadRequest();

            await db.sequelize.transaction(async (t) => {
                values.forEach(async (val) => {
                    await db.Category.update({ cat_pos: val.position }, { where: { cat_id: val.catId } }, { transaction: t });
                });
            });
            res.send({ message: "Update Success !!!" });
        } catch (error) {
            logger.error(`Error at Update Qbank Sub Category Position : ${error.message}`);
            next(error);
        }
    },

    getAllAdmin: async (req, res, next) => {
        try {
            const [Operator] = await db.sequelize.query(
                `select a.* ,count(b.quest_status) as actcount from tbl__operator as a 
                left join tbl__question as b on a.op_id=quest_add_id
                  and a.op_uname=b.quest_add_by and b.quest_status !='D'
                where a.op_status = 'Y' group by a.op_id`
            );
            if (!Operator) throw createError.NotFound("Operator Not Found !!!");
            res.send({ count: Operator.length, Operator: Operator });
        } catch (error) {
            next(error);
        }
    },
    getAllAdminQuestions: async (req, res, next) => {
        try {
            const {
                opid,
                startdate,
                enddate
            } = req.body;
            const [subcategory] = await db.sequelize.query(
                `SELECT count(*) as questions, quest_date FROM tbl__question where quest_add_id like '` + opid + `' and quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' group by Date(quest_date)`
            );
            res.send({ odata: subcategory });
        } catch (error) {
            next(error);
        }
    },

};

var entities = [
    ['amp', '&'],
    ['apos', '\''],
    ['#x27', '\''],
    ['#x2F', '/'],
    ['#39', '\''],
    ['#47', '/'],
    ['lt', '<'],
    ['gt', '>'],
    ['nbsp', ' '],
    ['quot', '"']
];