const db = require("../../Models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const logger = require("../../helper/userLogger");

module.exports = {
    // 1. Set Exam Taken User
    addItemToCart: async (req, res, next) => {
        try {
            console.log(req.body);
            let { master_cat, main_cat, sub_cat, productid, type, price, title } = req.body;
            if (!productid) throw createError.BadRequest();

            console.log(req.user);
            if (type == 'Sub Category') {
                const [cartitem, created] = await db.CartItems.findOrCreate({
                    where: {
                        [Op.or]: [
                            { exam_id: productid },
                            { sub_cat: sub_cat, item_type: 'Chapter' },
                            { sub_cat: sub_cat, item_type: 'Exam' }
                        ],
                        student_id: req.user.id, payment_status: 0
                    },
                    defaults: {
                        master_cat: master_cat,
                        main_cat: main_cat,
                        sub_cat: sub_cat,
                        exam_id: productid,
                        chapt_id: 0,
                        item_type: type,
                        product_title: title,
                        amount: price,
                        cgst: 0,
                        sgst: 0,
                        student_id: req.user.id,
                        payment_status: 0
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                let cartcount = await db.CartItems.count({
                    where: {
                        student_id: req.user.id, payment_status: 0
                    },
                })
                if (created) {
                    res.send({ message: "Success", cartcount: cartcount });
                } else {
                    res.send({ message: "Already Added !!!" });
                }
            }
            if (type == 'Chapter') {
                const [cartitem, created] = await db.CartItems.findOrCreate({
                    where: {
                        [Op.or]: [
                            { exam_id: productid },
                            { sub_cat: sub_cat, item_type: 'Sub Category' },
                            { sub_cat: sub_cat, item_type: 'Exam', chapt_id: productid }
                        ],
                        student_id: req.user.id, payment_status: 0
                    },
                    defaults: {
                        master_cat: master_cat,
                        main_cat: main_cat,
                        sub_cat: sub_cat,
                        chapt_id: productid,
                        exam_id: productid,
                        item_type: type,
                        product_title: title,
                        amount: price,
                        cgst: 0,
                        sgst: 0,
                        student_id: req.user.id,
                        payment_status: 0
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                let cartcount = await db.CartItems.count({
                    where: {
                        student_id: req.user.id, payment_status: 0
                    },
                })
                if (created) {
                    res.send({ message: "Success", cartcount: cartcount });
                } else {
                    res.send({ message: "Already Added !!!" });
                }
            }
            if (type == 'Exam') {
                let { exam_type_id } = req.body;
                const [cartitem, created] = await db.CartItems.findOrCreate({
                    where: {
                        [Op.or]: [
                            { exam_id: productid },
                            { sub_cat: sub_cat, item_type: 'Sub Category' },
                            { sub_cat: sub_cat, item_type: 'Chapter', exam_id: exam_type_id }
                        ],
                        student_id: req.user.id, payment_status: 0
                    },
                    defaults: {
                        master_cat: master_cat,
                        main_cat: main_cat,
                        sub_cat: sub_cat,
                        exam_id: productid,
                        chapt_id: exam_type_id,
                        item_type: type,
                        product_title: title,
                        amount: price,
                        cgst: 0,
                        sgst: 0,
                        student_id: req.user.id,
                        payment_status: 0
                    },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                let cartcount = await db.CartItems.count({
                    where: {
                        student_id: req.user.id, payment_status: 0
                    },
                })
                if (created) {
                    res.send({ message: "Success", cartcount: cartcount });
                } else {
                    res.send({ message: "Already Added !!!" });
                }
            }
        } catch (error) {
            logger.error(`Error at Set Cart Items : ${error.message}`);
            next(error);
        }
    },

    getAllCartItems: async (req, res, next) => {
        try {
            const { count, rows } = await db.CartItems.findAndCountAll({
                where: {
                    payment_status: 0,
                    student_id: req.user.id,
                },
                order: [["cart_items_id"]],
            });

            if (!rows) {
                throw createError.NotFound("Items not found.");
            }
            res.send({ count, cartitems: rows });
        } catch (error) {
            logger.error(`Error at Get All Items : ${error.message}`);
            next(error);
        }
    },

    removeItemFromCart: async (req, res, next) => {
        try {
            let { productid } = req.body;
            if (!productid) throw createError.BadRequest();

            await db.CartItems.destroy({
                where: {
                    exam_id: productid,
                    student_id: req.user.id,
                    payment_status: 0,
                }
            })
                .then((result) => res.sendStatus(204))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Delete Cart Items : ${error.message}`);
            next(error);
        }
    },

    getExistingCartItems: async (req, res, next) => {
        try {
            console.log(req.body);
            let { sub_cat, chapt_id, type } = req.body;
            if (type == 'Chapter') {
                const { count, rows } = await db.CartItems.findAndCountAll({
                    where: {
                        [Op.or]: [
                            { exam_id: chapt_id },
                            { sub_cat: sub_cat, item_type: 'Sub Category' },
                            { sub_cat: sub_cat, item_type: 'Exam', chapt_id: chapt_id }
                        ],
                        student_id: req.user.id, payment_status: 0
                    },
                });

                if (!rows) {
                    throw createError.NotFound("Items not found.");
                }
                res.send({ count, cartitems: rows });
            }
            if (type == 'Sub Category') {
                const { count, rows } = await db.CartItems.findAndCountAll({
                    where: {
                        [Op.or]: [
                            { exam_id: sub_cat },
                            { sub_cat: sub_cat, item_type: 'Chapter' },
                            { sub_cat: sub_cat, item_type: 'Exam' }
                        ],
                        student_id: req.user.id, payment_status: 0
                    },
                });

                if (!rows) {
                    throw createError.NotFound("Items not found.");
                }
                res.send({ count, cartitems: rows });
            }
        } catch (error) {
            logger.error(`Error at Get All Items : ${error.message}`);
            next(error);
        }
    },

};

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
                examTitle = `${category[0].category} >> ${category[0].subCategory} >> Topic-wise Test >> ${examChapter.chapter_name}`;
            } else if (rows[0].exam_type_cat === "T") {
                const examType = await db.ExamTypes.findOne({
                    where: { extype_id: rows[0].exam_type_id, extype_status: "Y" },
                }).catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
                //examTitle = `${categoryName.exa_cat_name} - ${subCategoryName.exa_cat_name} - ${examType.extest_type}`;
                examTitle = `${category[0].category} >> ${category[0].subCategory} >> ${examType.extest_type}`;
            }
            resolve({
                examTitle,
                masterCategoryName: category[0].masterCategory,
                examname: rows[0].exam_name,
            });
        } else {
            reject("No Title Avail");
        }
    });
}