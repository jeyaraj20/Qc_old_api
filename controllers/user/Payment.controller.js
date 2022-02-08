const db = require("../../Models");
const https = require("https");
const { Op } = require("sequelize");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const logger = require("../../helper/userLogger");
const { ImageFilter } = require("../../helper/general_helper");
const Razorpay = require("razorpay");
const request = require('request');
require("dotenv").config();

const instance = new Razorpay({
    key_id: process.env.RAZOR_PAY_KEY_ID,
    key_secret: process.env.RAZOR_PAY_KEY_SECRET,
});

module.exports = {
    // 1. Results Summary User
    getOrder: async (req, res, next) => {
        try {
            const { id, type } = req.body;
            console.log(id);
            let { rows } = await db.Exams.findAndCountAll({
                where: {
                    exam_id: id,
                    exam_status: "Y",
                },
            });
            console.log(req.user);
            let amount = rows[0].offer_price;
            const options = {
                amount: amount * 100, // amount == Rs 10
                currency: "INR",
                receipt: "receipt#1",
                payment_capture: 0,
                // 1 for automatic capture // 0 for manual capture
            };
            instance.orders.create(options, async function (err, order) {
                if (err) {
                    return res.status(500).json({
                        message: "Something Went Wrong",
                    });
                }
                console.log("data:", order);
                if (order.status == 'created') {
                    console.log(req.user);
                    let neworder = await db.Orders.create({
                        order_ref_id: order.id,
                        student_id: req.user.id,
                        payment_id: '0',
                        payment_status: 0,
                        amount: amount,
                        cgst: 0,
                        sgst: 0,
                        promocode: '',
                        paymentdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                    })
                        .then((result) => {
                            console.log(result.order_id)
                            db.OrderItems.create({
                                order_ref_id: result.order_id,
                                order_id: order.id,
                                exam_id: id,
                                order_type: type,
                                amount: amount,
                                cgst: 0,
                                sgst: 0,
                                student_id: req.user.id,
                                payment_status: 0,
                            })
                                .then((result) => {
                                    console.log('Success')
                                })
                        })
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                }
                return res.status(200).json(order);
            });
        } catch (error) {
            logger.error(`Something Went Wrong : ${error.message}`);
            next(error);
        }
    },

    getPayment: async (req, res, next) => {
        try {
            const { paymentId, amount } = req.body;
            return request(
                {
                    method: "POST",
                    url: `https://${process.env.RAZOR_PAY_KEY_ID}:${process.env.RAZOR_PAY_KEY_SECRET}@api.razorpay.com/v1/payments/${paymentId}/capture`,
                    form: {
                        amount: amount * 100, // amount == Rs 10 // Same As Order amount
                        currency: "INR",
                    },
                },
                async function (err, response, body) {
                    if (err) {
                        return res.status(500).json({
                            message: "Something Went Wrong",
                        });
                    }
                    console.log("Status:", response.statusCode);
                    console.log("Headers:", JSON.stringify(response.headers));
                    console.log("Response:", body);
                    let { id, status, order_id } = JSON.parse(body);
                    console.log(status);
                    if (status == 'captured') {
                        let orderupt = await db.Orders.update({
                            payment_id: id,
                            payment_status: 1,
                        },
                            { where: { order_ref_id: order_id } })
                            .then((result) => {
                                console.log('res', result)
                                db.OrderItems.update({
                                    payment_status: 1,
                                },
                                    { where: { order_id: order_id } })
                                    .then((result) => {
                                        console.log('succ')
                                        db.CartItems.destroy({
                                            where: {
                                                student_id: req.user.id,
                                            }
                                        })
                                            .then((result) => {
                                                console.log('cart succ')
                                            })
                                    })
                            })
                            .catch((err) => {
                                throw createError.InternalServerError(err.message);
                            });
                        console.log('tes', orderupt)
                    }
                    return res.status(200).json(body);
                });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Something Went Wrong",
            });
        }
    },

    getSubOrder: async (req, res, next) => {
        try {
            const { examid, price, type } = req.body;
            let amount = price;
            const options = {
                amount: amount * 100, // amount == Rs 10
                currency: "INR",
                receipt: "receipt#1",
                payment_capture: 0,
                // 1 for automatic capture // 0 for manual capture
            };
            instance.orders.create(options, async function (err, order) {
                if (err) {
                    return res.status(500).json({
                        message: "Something Went Wrong",
                    });
                }
                console.log("data:", order);
                if (order.status == 'created') {
                    console.log(req.user);
                    let neworder = await db.Orders.create({
                        order_ref_id: order.id,
                        student_id: req.user.id,
                        payment_id: '0',
                        payment_status: 0,
                        amount: amount,
                        cgst: 0,
                        sgst: 0,
                        method: '',
                        paymentdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                    })
                        .then((result) => {
                            console.log(result.order_id)
                            db.OrderItems.create({
                                order_ref_id: result.order_id,
                                order_id: order.id,
                                exam_id: examid,
                                order_type: type,
                                amount: amount,
                                cgst: 0,
                                sgst: 0,
                                student_id: req.user.id,
                                payment_status: 0,
                            })
                                .then((result) => {
                                    console.log('Success')
                                })
                        })
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                }
                return res.status(200).json(order);
            });
        } catch (error) {
            logger.error(`Something Went Wrong : ${error.message}`);
            next(error);
        }
    },

    getPromoCode: async (req, res, next) => {
        try {
            const { code } = req.params;
            console.log(code);
            const [codedetail, metadata] = await db.sequelize
                .query(
                    `SELECT * from tbl__coupon where coupon_status = 'Y' and coupon_code = ? AND CURDATE() BETWEEN from_date AND to_date`,
                    { replacements: [code] }
                )
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            if (!codedetail) throw createError.NotFound("Exam Main Category Not Found !!!");
            res.send({ codedetail });
        } catch (error) {
            logger.error(`Error at Performance Chart User : ${error.message}`);
            next(error);
        }
    },

    getCartOrder: async (req, res, next) => {
        const t = await db.sequelize.transaction();
        try {
            const { items, total, coupon } = req.body;
            console.log(items);
            console.log(total);
            let amount = total;
            const options = {
                amount: total * 100, // amount == Rs 10
                currency: "INR",
                receipt: "receipt#1",
                payment_capture: 0,
                // 1 for automatic capture // 0 for manual capture
            };
            instance.orders.create(options, async function (err, order) {
                if (err) {
                    return res.status(500).json({
                        message: "Something Went Wrong",
                    });
                }
                console.log("data:", order);
                if (order.status == 'created') {
                    console.log(req.user);
                    let neworder = await db.Orders.create({
                        order_ref_id: order.id,
                        student_id: req.user.id,
                        payment_id: '0',
                        payment_status: 0,
                        amount: amount,
                        cgst: 0,
                        sgst: 0,
                        promocode: coupon,
                        paymentdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                    })
                        .then(async (result) => {
                            console.log(result.order_id)
                            let itemList = [];
                            items.forEach((list) => {
                                itemList.push({
                                    order_ref_id: result.order_id,
                                    order_id: order.id,
                                    exam_id: list.id,
                                    order_type: list.type,
                                    amount: list.itemprice,
                                    cgst: 0,
                                    sgst: 0,
                                    student_id: req.user.id,
                                    payment_status: 0,
                                });
                            });

                            let insertdata = await db.OrderItems.bulkCreate(itemList, {
                                transaction: t,
                            }).catch((err) => {
                                throw createError.InternalServerError(err.message);
                            });
                        })
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                    await t.commit();
                }
                return res.status(200).json(order);
            });
        } catch (error) {
            logger.error(`Something Went Wrong : ${error.message}`);
            next(error);
        }
    },

    getUsedPromoCodeCount: async (req, res, next) => {
        try {
            let { code } = req.params;
            const [coupon, metadata] = await db.sequelize.query(
                `
                SELECT COUNT(b.promocode) as usedcount, a.* from tbl__coupon as a 
left JOIN tbl__order as b on b.promocode = a.coupon_code and b.payment_status = 1
where a.coupon_status = 'Y' and a.coupon_code = ?
            `,
                { replacements: [code] }
            );
            const [perusercoupon, data] = await db.sequelize.query(
                `
                SELECT COUNT(b.promocode) as noofuserusedcount, a.* from tbl__coupon as a 
left JOIN tbl__order as b on b.promocode = a.coupon_code and b.student_id = ? and b.payment_status = 1
where a.coupon_status = 'Y' and a.coupon_code = ?
            `,
                { replacements: [req.user.id, code] }
            );
            if (!coupon) throw createError.NotFound("Coupon Not Found !!!");
            res.send({ count: coupon.length, coupon, usercount: perusercoupon });
        } catch (error) {
            logger.error(`Error at Get All Coupon : ${error.message}`);
            next(error);
        }
    },

}
