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

    // 1. Get All Coupons
    getAllCoupons: async (req, res, next) => {
        try {
            let { status } = req.params;
            const [coupon, metadata] = await db.sequelize.query(
                `
                SELECT * from tbl__coupon where coupon_status = ?
            `,
                { replacements: [status] }
            );
            if (!coupon) throw createError.NotFound("Coupon Not Found !!!");
            res.send({ count: coupon.length, coupon });
        } catch (error) {
            logger.error(`Error at Get All Coupon : ${error.message}`);
            next(error);
        }
    },

    createCoupon: async (req, res, next) => {
        try {
            const { coupon_name, coupon_code, coupon_value, coupon_value_type, cart_value_range, cart_value_range_type, cart_value, no_of_usage, no_of_usage_user, from_date, to_date } = req.body;
            if (!coupon_name || !coupon_code || !coupon_value || !coupon_value_type) throw createError.BadRequest();
            db.sequelize
                .transaction(async (t) => {
                    await db.Coupon.create({
                        coupon_name,
                        coupon_code,
                        coupon_value,
                        coupon_value_type,
                        cart_value_range,
                        cart_value_range_type,
                        cart_value_range_type,
                        cart_value,
                        no_of_usage,
                        no_of_usage_user,
                        from_date,
                        to_date,
                        coupon_status: 'Y'
                    })
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
            res.send({ message: "Insert Success" });
        } catch (error) {
            logger.error(`Error at Create Coupon : ${error.message}`);
            next(error);
        }
    },

    updateCoupon: async (req, res, next) => {
        try {
            let { coupon_id } = req.params;
            if (coupon_id == 0) throw createError.BadRequest();

            const { coupon_name, coupon_code, coupon_value, coupon_value_type, cart_value_range, cart_value_range_type, cart_value, no_of_usage, no_of_usage_user, from_date, to_date } = req.body;
            if (!coupon_name || !coupon_code || !coupon_value || !coupon_value_type) throw createError.BadRequest();

            await db.Coupon.update(
                {
                    coupon_name,
                    coupon_code,
                    coupon_value,
                    coupon_value_type,
                    cart_value_range,
                    cart_value_range_type,
                    cart_value_range_type,
                    cart_value,
                    no_of_usage,
                    no_of_usage_user,
                    from_date,
                    to_date
                },
                { where: { coupon_id: coupon_id } }
            )
                .then((result) => res.send({ message: "Updated Success" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update Exam Package : ${error.message}`);
            next(error);
        }
    },

    // 5. Update 'Active / Inactive / Delete'
    updateStatusById: async (req, res, next) => {
        try {
            let { couponId, status } = req.body;
            if (!couponId || !status) throw createError.BadRequest();

            await db.sequelize
                .transaction(async (t) => {
                    await db.Coupon.update(
                        { coupon_status: status },
                        { where: { coupon_id: couponId } },
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

};
