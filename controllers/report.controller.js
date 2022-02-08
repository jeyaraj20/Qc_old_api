const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const logger = require("../helper/adminLogger");
const { ImageFilter } = require("../helper/general_helper");
const { sort, next } = require("locutus/php/array");
const { Op } = require("sequelize");
const { BadRequest } = require("http-errors");
require("dotenv").config();

const handlebars = require('handlebars');
var pdf = require('html-pdf');

const Reports_html = fs.readFileSync(path.resolve(__dirname, '../templates/reports.html'), 'utf8');
const template = handlebars.compile(Reports_html);
const main_html = fs.readFileSync(path.resolve(__dirname, '../templates/maincategory.html'), 'utf8');
const template2 = handlebars.compile(main_html);
const test_html = fs.readFileSync(path.resolve(__dirname, '../templates/test.html'), 'utf8');
const template3 = handlebars.compile(test_html);
const overall_main_html = fs.readFileSync(path.resolve(__dirname, '../templates/overallmaincategory.html'), 'utf8');
const template4 = handlebars.compile(overall_main_html);

module.exports = {
    // 1. Get Overall Reports.
    getReportsNew: async (req, res, next) => {
        try {
            const {
                period,
                startdate,
                enddate
            } = req.body;

            let [data] = await db.sequelize.query(
                `select cat2.cat_id, cat1.cat_name as maincategory, cat2.cat_name as subcategory, cat2.cat_code as subcategorycode
                     from tbl__category as cat1 join tbl__category as cat2 on cat2.pid = cat1.cat_id
                    where cat1.cat_status = 'Y' and cat2.cat_status = 'Y'
                     `
            );

            let [uploaded] = await db.sequelize.query(
                `select count(*) as uploaded, que.sub_id from tbl__question as que where que.quest_status <> 'D' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' GROUP BY que.sub_id`
            );
            let [waiting] = await db.sequelize.query(
                `select count(*) as waiting, que.sub_id from tbl__question as que where que.quest_status = 'W' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'  GROUP BY que.sub_id`
            );
            let [active] = await db.sequelize.query(
                `select count(*) as active, que.sub_id from tbl__question as que where que.quest_status = 'Y' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'  GROUP BY que.sub_id`
            );
            let [inactive] = await db.sequelize.query(
                `select count(*) as inactive, que.sub_id from tbl__question as que where que.quest_status = 'N' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'  GROUP BY que.sub_id`
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
                    uploadedCount = uploadedArr[0].uploaded;
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

                if (uploadedArr.length != 0 || waitingArr.length != 0 || activeArr.length != 0 || inactiveArr.length != 0) {
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

            }

            /*
            res.send({
                count: data.length,
                qdata: finalArr
            }); */

            console.log(finalArr);
            const html = template({ data: finalArr });

            console.log(__dirname);

            

            pdf.create(html).toFile(path.join(__dirname, './report.pdf'), function (err, data1) {
                if (err) {
                    console.log(err);
                    res.send({ statusCode: 201, message: 'Create pdf failed.' });
                } else {
                    fs.readFile(path.join(__dirname, './report.pdf'), function (err, data2) {
                        res.header('Content-Type', 'application/pdf');
                        req.header('Content-Transfer-Encoding', 'Binary');
                        res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
                        res.send(data2);
                    });
                }
            });

        } catch (error) {
            next(error);
        }
    },
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
                     from tbl__category as cat1 join tbl__category as cat2 on cat2.pid = cat1.cat_id
                    where cat1.cat_status = 'Y' and cat2.cat_status = 'Y'
                     `
            ); // remove limit 10

            let [uploaded] = await db.sequelize.query(
                `select count(*) as uploaded, que.sub_id from tbl__question as que where que.quest_status <> 'D' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' GROUP BY que.sub_id`
            );
            let [waiting] = await db.sequelize.query(
                `select count(*) as waiting, que.sub_id from tbl__question as que where que.quest_status = 'W' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'  GROUP BY que.sub_id`
            );
            let [active] = await db.sequelize.query(
                `select count(*) as active, que.sub_id from tbl__question as que where que.quest_status = 'Y' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'  GROUP BY que.sub_id`
            );
            let [inactive] = await db.sequelize.query(
                `select count(*) as inactive, que.sub_id from tbl__question as que where que.quest_status = 'N' and que.quest_date BETWEEN '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'  GROUP BY que.sub_id`
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
                    uploadedCount = uploadedArr[0].uploaded;
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

                if (uploadedArr.length != 0 || waitingArr.length != 0 || activeArr.length != 0 || inactiveArr.length != 0) {
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

            }

            //console.log(data);
            //let { processeddata } = await getOverallData(data, startdate, enddate);
            //console.log(processeddata);
            res.send({
                count: data.length,
                qdata: finalArr
            });

        } catch (error) {
            next(error);
        }
    },
    getMainReportsNew: async (req, res, next) => {
        try {
            const {
                period,
                startdate,
                enddate
            } = req.body;

            let [categories] = await db.sequelize.query(
                `SELECT cat_id, cat_name from tbl__category where pid = 0 and cat_status !='D'
                     `
            );
            let [waiting] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as waiting from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'W' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
                     `
            );

            let [active] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as active from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'Y' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
                     `
            );

            let [inactive] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as inactive from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'N' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
                     `
            );

            let [totalquestion] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as total from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status != 'D' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
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
                if (totalArr.length != 0 || waitingArr.length != 0 || activeArr.length != 0 || inactiveArr.length != 0) {
                    finalArr.push({
                        categoryname: category.cat_name,
                        waiting: waitingCount,
                        active: activeCount,
                        inactive: inactiveCount,
                        total: totalCount
                    });
                }
            }
            console.log(finalArr);

            /*res.send({
                data: finalArr
            });*/

            const html = template2({ data: finalArr });            

            pdf.create(html).toFile(path.join(__dirname, './report.pdf'), function (err, data1) {
                if (err) {
                    console.log(err);
                    res.send({ statusCode: 201, message: 'Create pdf failed.' });
                } else {
                    fs.readFile(path.join(__dirname, './report.pdf'), function (err, data2) {
                        res.header('Content-Type', 'application/pdf');
                        req.header('Content-Transfer-Encoding', 'Binary');
                        res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
                        res.send(data2);
                    });
                }
            });

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
                `SELECT cat_id, cat_name from tbl__category where pid = 0 and cat_status !='D'
                     `
            );
            let [waiting] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as waiting from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'W' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
                     `
            );

            let [active] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as active from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'Y' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
                     `
            );

            let [inactive] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as inactive from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status = 'N' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
                     `
            );

            let [totalquestion] = await db.sequelize.query(
                `SELECT b.cat_name, b.cat_id, COUNT(a.cat_id) as total from tbl__question as a 
                INNER JOIN tbl__category as b on b.cat_id = a.cat_id 
                WHERE b.pid = 0 and a.quest_status != 'D' and 
                a.quest_date BETWEEN '${startdate} 00:00:00' AND '${enddate} 23:59:59' GROUP BY b.cat_id
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
                if (totalArr.length != 0 || waitingArr.length != 0 || activeArr.length != 0 || inactiveArr.length != 0) {
                    finalArr.push({
                        categoryname: category.cat_name,
                        waiting: waitingCount,
                        active: activeCount,
                        inactive: inactiveCount,
                        total: totalCount
                    });
                }
            }
            //console.log(finalArr);

            res.send({
                data: finalArr
            });

        } catch (error) {
            next(error);
        }
    },
    getTestReportsNew: async (req, res, next) => {
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
                from tbl__exam as exam,
                tbl__exam_category as ec1
                join tbl__exam_category as ec2 on ec1.exaid_sub = ec2.exa_cat_id
                join tbl__exam_category as ec3 on ec1.exaid = ec3.exa_cat_id 
                where exam.exam_status <> 'D' AND
                exam.exam_sub_sub = ec1.exa_cat_id AND
                exam.exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'
                `
            ); //remove limit 20
            let [examtypename1] = await db.sequelize.query(
                `SELECT chapter_name as examname, chapt_id FROM tbl__examchapters Group by chapt_id`
            );
            let [examtypename2] = await db.sequelize.query(
                `SELECT extest_type as examname, extype_id FROM tbl__examtypes Group by extype_id`
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
                    examdate: moment(new Date(category.examdate)).format("DD-MM-YYYY HH:mm:ss"),
                    examtypename: examtypenameCount
                });
            }

            //let { processeddata } = await getTestData(data, startdate, enddate);
            /*
            res.send({
                count: data.length,
                qdata: finalArr
            });*/

            const html = template3({ data: finalArr });            

            pdf.create(html).toFile(path.join(__dirname, './report.pdf'), function (err, data1) {
                if (err) {
                    console.log(err);
                    res.send({ statusCode: 201, message: 'Create pdf failed.' });
                } else {
                    fs.readFile(path.join(__dirname, './report.pdf'), function (err, data2) {
                        res.header('Content-Type', 'application/pdf');
                        req.header('Content-Transfer-Encoding', 'Binary');
                        res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
                        res.send(data2);
                    });
                }
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
                from tbl__exam as exam,
                tbl__exam_category as ec1
                join tbl__exam_category as ec2 on ec1.exaid_sub = ec2.exa_cat_id
                join tbl__exam_category as ec3 on ec1.exaid = ec3.exa_cat_id 
                where exam.exam_status <> 'D' AND
                exam.exam_sub_sub = ec1.exa_cat_id AND
                exam.exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59'
                `
            ); //remove limit 20
            let [examtypename1] = await db.sequelize.query(
                `SELECT chapter_name as examname, chapt_id FROM tbl__examchapters Group by chapt_id`
            );
            let [examtypename2] = await db.sequelize.query(
                `SELECT extest_type as examname, extype_id FROM tbl__examtypes Group by extype_id`
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
    getOverallMastersNew: async (req, res, next) => {
        try {
            const {
                period,
                startdate,
                enddate
            } = req.body;

            let [data] = await db.sequelize.query(
                `select ec3.exa_cat_name as mastercategory, ec2.exa_cat_name as maincategory, ec1.exa_cat_name as subcategory,
                ec3.exa_cat_id as masterid, ec2.exa_cat_id as mainid, ec1.exa_cat_id as subid
                from tbl__exam_category as ec1
                join tbl__exam_category as ec2 on ec1.exaid_sub = ec2.exa_cat_id
                join tbl__exam_category as ec3 on ec1.exaid = ec3.exa_cat_id 
				GROUP BY ec3.exa_cat_name, ec2.exa_cat_name, ec1.exa_cat_name
                `
            ); //remove limit 20

            let [totalquestions] = await db.sequelize.query(
                `select count(*) as totalquestions,ex.exam_cat, ex.exam_sub, ex.exam_sub_sub from tbl__examquestions as eq, tbl__exam as ex where eq.exam_id = ex.exam_id and ex.exam_status <> 'D' and ex.exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by ex.exam_cat, ex.exam_sub, ex.exam_sub_sub`
            );
            let [topicwisereports] = await db.sequelize.query(
                `select count(*) as topicwisereports, exam_cat, exam_sub, exam_sub_sub from tbl__exam where exam_type_cat = 'C' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [fulltests] = await db.sequelize.query(
                `select count(*) as fulltests, exam_cat, exam_sub, exam_sub_sub from tbl__exam where exam_type_cat = 'B' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [secsubject] = await db.sequelize.query(
                `select count(*) as secsubject, exam_cat, exam_sub, exam_sub_sub from tbl__exam where sect_cutoff = 'Y' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [sectiming] = await db.sequelize.query(
                `select count(*) as sectiming, exam_cat, exam_sub, exam_sub_sub from tbl__exam where sect_timing = 'Y' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
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
                if (totalquestionsArr.length != 0 || topicwisereportsArr.length != 0 || fulltestsArr.length != 0 || secsubjectArr.length != 0 || sectimingArr.length != 0) {
                    finalArr.push({
                        mastercategory: category.mastercategory,
                        maincategory: category.maincategory,
                        subcategory: category.subcategory,
                        totalquestions: totalquestionsCount,
                        topicwisereports: topicwisereportsCount,
                        fulltests: fulltestsCount,
                        secsubject: secsubjectCount,
                        sectiming: sectimingCount
                    });
                }
            }

            //let { processeddata } = await getOverallmasterData(data, startdate, enddate);
            /*
            res.send({
                count: data.length,
                qdata: finalArr
            });
            */

            const html = template4({ data: finalArr });            

            pdf.create(html).toFile(path.join(__dirname, './report.pdf'), function (err, data1) {
                if (err) {
                    console.log(err);
                    res.send({ statusCode: 201, message: 'Create pdf failed.' });
                } else {
                    fs.readFile(path.join(__dirname, './report.pdf'), function (err, data2) {
                        res.header('Content-Type', 'application/pdf');
                        req.header('Content-Transfer-Encoding', 'Binary');
                        res.header('Content-Disposition', 'attachment; filename="' + 'download-' + Date.now() + '.pdf"');
                        res.send(data2);
                    });
                }
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
                from tbl__exam_category as ec1
                join tbl__exam_category as ec2 on ec1.exaid_sub = ec2.exa_cat_id
                join tbl__exam_category as ec3 on ec1.exaid = ec3.exa_cat_id 
				GROUP BY ec3.exa_cat_name, ec2.exa_cat_name, ec1.exa_cat_name
                `
            ); //remove limit 20

            let [totalquestions] = await db.sequelize.query(
                `select count(*) as totalquestions,ex.exam_cat, ex.exam_sub, ex.exam_sub_sub from tbl__examquestions as eq, tbl__exam as ex where eq.exam_id = ex.exam_id and ex.exam_status <> 'D' and ex.exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by ex.exam_cat, ex.exam_sub, ex.exam_sub_sub`
            );
            let [topicwisereports] = await db.sequelize.query(
                `select count(*) as topicwisereports, exam_cat, exam_sub, exam_sub_sub from tbl__exam where exam_type_cat = 'C' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [fulltests] = await db.sequelize.query(
                `select count(*) as fulltests, exam_cat, exam_sub, exam_sub_sub from tbl__exam where exam_type_cat = 'B' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [secsubject] = await db.sequelize.query(
                `select count(*) as secsubject, exam_cat, exam_sub, exam_sub_sub from tbl__exam where sect_cutoff = 'Y' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
            );
            let [sectiming] = await db.sequelize.query(
                `select count(*) as sectiming, exam_cat, exam_sub, exam_sub_sub from tbl__exam where sect_timing = 'Y' and exam_status <> 'D' and exam_date between '` + startdate + ` 00:00:00' and '` + enddate + ` 23:59:59' Group by exam_cat, exam_sub, exam_sub_sub`
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
                if (totalquestionsArr.length != 0 || topicwisereportsArr.length != 0 || fulltestsArr.length != 0 || secsubjectArr.length != 0 || sectimingArr.length != 0) {
                    finalArr.push({
                        mastercategory: category.mastercategory,
                        maincategory: category.maincategory,
                        subcategory: category.subcategory,
                        totalquestions: totalquestionsCount,
                        topicwisereports: topicwisereportsCount,
                        fulltests: fulltestsCount,
                        secsubject: secsubjectCount,
                        sectiming: sectimingCount
                    });
                }
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
                //console.log(`select count(*) as uploaded from tbl__question as que where que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`);
                let [uploaded] = await db.sequelize.query(
                    `select count(*) as uploaded from tbl__question as que where que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [waiting] = await db.sequelize.query(
                    `select count(*) as waiting from tbl__question as que where que.quest_status = 'W' and que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [active] = await db.sequelize.query(
                    `select count(*) as active from tbl__question as que where que.quest_status = 'Y' and que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [inactive] = await db.sequelize.query(
                    `select count(*) as inactive from tbl__question as que where que.quest_status = 'N' and que.sub_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
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
                    `select count(*) as uploaded from tbl__question as que where que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );

                let [waiting] = await db.sequelize.query(
                    `select count(*) as waiting from tbl__question as que where que.quest_status = 'W' and que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [active] = await db.sequelize.query(
                    `select count(*) as active from tbl__question as que where que.quest_status = 'Y' and que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
                );
                let [inactive] = await db.sequelize.query(
                    `select count(*) as inactive from tbl__question as que where que.quest_status = 'N' and que.cat_id = ` + list.cat_id + ` and que.quest_date BETWEEN '` + startdate + `' and '` + enddate + `'`
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
                        `SELECT chapter_name as examname FROM tbl__examchapters where chapt_id = ` + list.examptype
                    );
                } else if (list.examcat == 'T') {
                    examtypename = await db.sequelize.query(
                        `SELECT extest_type as examname FROM tbl__examtypes where extype_id = ` + list.examptype
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
                    `select count(*) as totalquestions from tbl__examquestions where exam_id in (select exam_id from tbl__exam where exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `' Group by exam_cat, exam_sub, exam_sub_sub)`
                );
                let [topicwisereports] = await db.sequelize.query(
                    `select count(*) as topicwisereports from tbl__exam where exam_type_cat = 'C' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
                );
                let [fulltests] = await db.sequelize.query(
                    `select count(*) as fulltests from tbl__exam where exam_type_cat = 'B' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
                );
                let [secsubject] = await db.sequelize.query(
                    `select count(*) as secsubject from tbl__exam where sect_cutoff = 'Y' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
                );
                let [sectiming] = await db.sequelize.query(
                    `select count(*) as sectiming from tbl__exam where sect_timing = 'Y' and exam_cat = ` + list.masterid + ` and exam_sub = ` + list.mainid + ` and exam_sub_sub = ` + list.subid + ` and exam_status <> 'D' and exam_date between '` + startdate + `' and '` + enddate + `'`
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