const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require('../helper/adminLogger');

module.exports = {
    // 1. Get All Active Student
    getByField: async (req, res, next) => {
        try {
            const { table, field, value, uniqueId, uniqueValue, statusField } = req.body;
            if (field == null || value == null) throw createHttpError.BadRequest();
            if (uniqueValue) {
                const [data] = await db.sequelize.query(
                    `select * from ` + table + `
                        where `+ field + `=? and ` + uniqueId + ` != ? and ` + statusField + `!='D'`,
                    { replacements: [value, uniqueValue] }
                );
                res.send({ count: data.length });
            }
            else {

                const [data] = await db.sequelize.query(
                    `select * from ` + table + `
                        where `+ field + `=? and ` + statusField + `!='D'`,
                    { replacements: [value] }
                );
                res.send({ count: data.length });
            }
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory : ${error.message}`);
            next(error);
        }
    },

    getByFieldForExamCategory: async (req, res, next) => {
        try {
            const { table, field, value, uniqueId, uniqueValue, id, idvalue, statusField, type } = req.body;
            if (field == null || value == null) throw createHttpError.BadRequest();
            if (idvalue) {
                const [data] = await db.sequelize.query(
                    `select * from ` + table + `
                        where `+ field + `=? and ` + id + ` != ? and ` + uniqueId + ` = ? and examcat_type = ? and ` + statusField + `!='D'`,
                    { replacements: [value, idvalue, uniqueValue, type] }
                );
                res.send({ count: data.length });
            } else {
                const [data] = await db.sequelize.query(
                    `select * from ` + table + `
                        where `+ field + `=? and ` + uniqueId + ` = ? and examcat_type = ? and ` + statusField + `!='D'`,
                    { replacements: [value, uniqueValue, type] }
                );
                res.send({ count: data.length });
            }
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory : ${error.message}`);
            next(error);
        }
    },

    getByFieldForExamSubCategory: async (req, res, next) => {
        try {
            const { table, field, value, exaId, exaIdSub, exacatid, exacatidvalue, exaIdValue, exaIdSubValue, statusField } = req.body;
            if (field == null || value == null) throw createHttpError.BadRequest();
            if (exacatidvalue) {
                const [data] = await db.sequelize.query(
                    `select * from ` + table + `
                        where `+ field + `=? and ` + exacatid + ` != ? and ` + exaId + ` = ? and ` + exaIdSub + ` = ? and ` + statusField + `!='D'`,
                    { replacements: [value, exacatidvalue, exaIdValue, exaIdSubValue] }
                );
                res.send({ count: data.length });
            } else {
                const [data] = await db.sequelize.query(
                    `select * from ` + table + `
                        where `+ field + `=? and ` + exaId + ` = ? and ` + exaIdSub + ` = ? and ` + statusField + `!='D'`,
                    { replacements: [value, exaIdValue, exaIdSubValue] }
                );
                res.send({ count: data.length });
            }
        } catch (error) {
            logger.error(`Error at Get All Active SubCategory : ${error.message}`);
            next(error);
        }
    },
};
