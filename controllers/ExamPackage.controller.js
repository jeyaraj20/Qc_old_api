const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const { Op } = require("sequelize");
const { is_string } = require("locutus/php/var");
const logger = require('../helper/adminLogger');

module.exports = {

    getAllDurations: async (req, res, next) => {
        try {
            const [durations, metadata] = await db.sequelize.query(
                `
                select * from tbl__duration
            `
            );
            if (!durations) throw createError.NotFound("Duration Not Found !!!");
            res.send({ durations });
        } catch (error) {
            logger.error(`Error at Get All Exam Package : ${error.message}`);
            next(error);
        }
    },

    // 1. Get All Exam Package
    getAllExamPackage: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [category, metadata] = await db.sequelize.query(
                `
                select b.exa_cat_name as mastercategory,c.exa_cat_name as maincategory, d.exa_cat_name as subcategory, a.* from tbl__exampackage as a
                inner JOIN tbl__exam_category AS b ON a.master_cat=b.exa_cat_id
                left JOIN tbl__exam_category AS c ON c.exa_cat_id=a.main_cat
                left JOIN tbl__exam_category AS d ON d.exa_cat_id=a.sub_cat
                where package_status = ?
            `,
                { replacements: [status, status] }
            );
            if (!category) throw createError.NotFound("Exam Package Not Found !!!");
            res.send({ count: category.length, category });
        } catch (error) {
            logger.error(`Error at Get All Exam Package : ${error.message}`);
            next(error);
        }
    },

    /*createExamPackage: async (req, res, next) => {
        try {
            console.log(req.body);
            const { package_name, master_cat, main_cat, sub_cat, selling_price, offer_price } = req.body;
            if (!package_name || !master_cat || !selling_price || !offer_price) throw createError.BadRequest();
            await db.ExamPackage.create({
                package_name,
                master_cat,
                main_cat,
                sub_cat,
                selling_price,
                offer_price,
                package_status: "Y",
                package_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                package_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            })
                .then((message) => res.send({ message }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Create Exam Package : ${error.message}`);
            next(error);
        }
    },*/

    createExamPackage: async (req, res, next) => {
        try {
            const { package_name, master_cat, main_cat, sub_cat, chapt_id, duration, selling_price } = req.body;
            if (!package_name || !master_cat || !selling_price || !duration) throw createError.BadRequest();
            db.sequelize
                .transaction(async (t) => {
                    // 1. tbl__exampackage insert
                    const exampackage = await db.ExamPackage.create({
                        package_name,
                        master_cat,
                        main_cat,
                        sub_cat,
                        chapt_id,
                        selling_price,
                        package_status: "Y",
                        package_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        package_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    })
                    console.log(exampackage.package_id);

                    if (master_cat && main_cat == '' && sub_cat == '' && chapt_id == '') {
                        await db.ExamMainCategory.update(
                            {
                                payment_flag: 'Y',
                                exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            },
                            { where: { exa_cat_id: master_cat } }
                        )
                    }

                    if (master_cat && main_cat && sub_cat == '' && chapt_id == '') {
                        await db.ExamMainCategory.update(
                            {
                                payment_flag: 'Y',
                                exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            },
                            { where: { exa_cat_id: main_cat } }
                        )
                    }

                    if (master_cat && main_cat && sub_cat && chapt_id == '') {
                        await db.ExamMainCategory.update(
                            {
                                payment_flag: 'Y',
                                exa_cat_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            },
                            { where: { exa_cat_id: sub_cat } }
                        )
                    }

                    if (master_cat && main_cat && sub_cat && chapt_id) {
                        await db.ExamChapters.update(
                            {
                                paymentFlag: 'Y',
                                lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            },
                            { where: { chapt_id: chapt_id } }
                        )
                    }

                    let packageDurationList = [];
                    duration.forEach((list) => {
                        packageDurationList.push({
                            exam_package_ref_id: exampackage.package_id,
                            duration_ref_id: list.durationId,
                            price: list.price
                        });
                    });
                    console.log(packageDurationList);

                    // 3. tbl__exampackage_duration insert
                    await db.ExamPackageDuration.bulkCreate(packageDurationList, {
                        transaction: t,
                    });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ message: "Insert Success" });
        } catch (error) {
            logger.error(`Error at Create Exam Package : ${error.message}`);
            next(error);
        }
    },

    updateExamPackage: async (req, res, next) => {
        try {
            let { package_id } = req.params;
            if (package_id == 0) throw createError.BadRequest();

            const { package_name, master_cat, main_cat, sub_cat, chapt_id, duration, selling_price } = req.body;
            if (!package_name || !master_cat || !selling_price || !duration) throw createError.BadRequest();
            db.sequelize
                .transaction(async (t) => {
                    await db.ExamPackage.update(
                        {
                            package_name,
                            master_cat,
                            main_cat,
                            sub_cat,
                            chapt_id,
                            selling_price,
                            package_lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                        },
                        { where: { package_id: package_id } }
                    )
                    await db.ExamPackageDuration.destroy({ where: { exam_package_ref_id: package_id } })
                    let packageDurationList = [];
                    duration.forEach((list) => {
                        packageDurationList.push({
                            exam_package_ref_id: package_id,
                            duration_ref_id: list.durationId,
                            price: list.price
                        });
                    });
                    console.log(packageDurationList);

                    // 3. tbl__exampackage_duration insert
                    await db.ExamPackageDuration.bulkCreate(packageDurationList, {
                        transaction: t,
                    });
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ message: "Update Success" });
        } catch (error) {
            logger.error(`Error at Update Exam Package : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Active / Inactive / Delete'
    updateStatusById: async (req, res, next) => {
        try {
            let { packageId, status } = req.body;
            if (!packageId || !status) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    await db.ExamPackage.update(
                        { package_status: status },
                        { where: { package_id: packageId } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Exam Package Status : ${error.message}`);
            next(error);
        }
    },

    getExamDurations: async (req, res, next) => {
        try {
            let { package_id } = req.params;
            if (package_id == 0) throw createError.BadRequest();

            const [durations, metadata] = await db.sequelize.query(
                `
                SELECT c.*,a.price FROM tbl__exampackage_duration as a INNER JOIN tbl__exampackage as b on b.package_id = a.exam_package_ref_id INNER JOIN tbl__duration as c on c.duration_id = a.duration_ref_id where b.package_id = ?
            `,
                { replacements: [package_id] }
            );
            if (!durations) throw createError.NotFound("Duration Not Found !!!");
            res.send({ durations });
        } catch (error) {
            logger.error(`Error at Get All Exam Durations : ${error.message}`);
            next(error);
        }
    },

};
