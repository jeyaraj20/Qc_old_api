const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const logger = require('../helper/adminLogger');

db.State.belongsTo(db.Country, {
    targetKey: "country_id",
    foreignKey: "country_id",
});
db.City.belongsTo(db.State, { targetKey: "state_id", foreignKey: "state_id" });
module.exports = {
    // 1. Get All Active Country By Status
    getAllCountry: async (req, res, next) => {
        try {
            let { status } = req.params;
            const { count, rows } = await db.Country.findAndCountAll({
                where: { country_status: status },
                order: [["country_name"]],
            });

            if (!rows) {
                throw createError.NotFound("Country Not Found !!!");
            }
            res.send({ count, country: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Country By Status : ${error.message}`);
            next(error);
        }
    },
    // 2. Get All Active State By Status
    getAllState: async (req, res, next) => {
        try {
            let { status } = req.params;
            const { count, rows } = await db.State.findAndCountAll({
                where: { state_status: status },
                include: [{ model: db.Country }],
                order: [["state_name"]],
            });

            if (!rows) {
                throw createError.NotFound("State Not Found !!!");
            }
            res.send({ count, state: rows });
        } catch (error) {
            logger.error(`Error at Get All Active State By Status : ${error.message}`);
            next(error);
        }
    },
    // 3. Get All Active City By Status
    getAllCity: async (req, res, next) => {
        try {
            let { status } = req.params;
            const { count, rows } = await db.City.findAndCountAll({
                where: { city_status: status },
                order: [["city_name"]],
                include: [{ model: db.State }],
            });

            if (!rows) {
                throw createError.NotFound("City Not Found !!!");
            }
            res.send({ count, city: rows });
        } catch (error) {
            logger.error(`Error at Get All Active City By Status : ${error.message}`);
            next(error);
        }
    },
    createState: async (req, res, next) => {
        try {
            const { country_id, state_name, country_code } = req.body;

            await db.State.create({
                country_id,
                state_name,
                country_code,
                state_status: "Y",
                lastdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            })
                .then((result) => {
                    res.send({
                        message: result,
                    });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Create State : ${error.message}`);
            next(error);
        }
    },

    updateState: async (req, res, next) => {
        try {
            let { stateId } = req.params;
            const { country_id, state_name, country_code } = req.body;

            await db.State.update(
                {
                    country_id,
                    state_name,
                    country_code,
                    //state_status: "Y",
                    lastdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
                { where: { state_id: stateId } }
            )
                .then((result) => {
                    res.send({
                        message: result,
                    });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update State : ${error.message}`);
            next(error);
        }
    },
    updateStateStatus: async (req, res, next) => {
        try {
            let { stateId, status } = req.body;
            if (!stateId || !status) throw createError.BadRequest();
            await db.sequelize
                .transaction(async (t) => {
                    await db.State.update(
                        { state_status: status },
                        { where: { state_id: stateId } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update State Status : ${error.message}`);
            next(error);
        }
    },

    createCity: async (req, res, next) => {
        try {
            const { state_id, city_name, city_code } = req.body;

            await db.City.create({
                state_id,
                city_name,
                city_code,
                city_status: "Y",
                lastupdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            })
                .then((result) => {
                    res.send({
                        message: result,
                    });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Create City : ${error.message}`);
            next(error);
        }
    },

    updateCity: async (req, res, next) => {
        try {
            let { cityId } = req.params;
            const { state_id, city_name, city_code } = req.body;

            await db.City.update(
                {
                    state_id,
                    city_name,
                    city_code,
                    state_status: "Y",
                    lastdate: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                },
                { where: { city_id: cityId } }
            )
                .then((result) => {
                    res.send({
                        message: result,
                    });
                })
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update City : ${error.message}`);
            next(error);
        }
    },
    updateCityStatus: async (req, res, next) => {
        try {
            let { cityId, status } = req.body;
            if (!cityId || !status) throw createError.BadRequest();
            await db.sequelize
                .transaction(async (t) => {
                    await db.City.update(
                        { city_status: status },
                        { where: { city_id: cityId } },
                        { transaction: t }
                    );
                })
                .then((result) => res.send({ message: "Update Success !!!" }))
                .catch((err) => {
                    throw createError.InternalServerError(err.message);
                });
        } catch (error) {
            logger.error(`Error at Update City Status : ${error.message}`);
            next(error);
        }
    },
    getStateByName: async (req, res, next) => {
        try {
            let { statename } = req.params;
            let state = await db.State.findOne({
                where: { state_name: statename }
            });

            if (!state) {
                throw createError.NotFound("State Not Found !!!");
            }
            res.send({  state: state });
        } catch (error) {
            logger.error(`Error at Get State By Name : ${error.message}`);
            next(error);
        }
    },
    // 3. Get All Active City By Status
    getCityByName: async (req, res, next) => {
        try {
            let { cityname } = req.params;
            let city = await db.City.findOne({
                where: { city_name: cityname }
            });
            if (!city) {
                throw createError.NotFound("City Not Found !!!");
            }
            res.send({ city: city });
        } catch (error) {
            logger.error(`Error at Get All Active City By Status : ${error.message}`);
            next(error);
        }
    },

    // 12. Get State Count Only
    getStateCount: async (req, res, next) => {
        try {
            let { state_status } = req.params;
            if (state_status == null) throw createError.BadRequest();
            let count = 0;
            count = await db.State.count({
                where: { state_status },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get State Count Only : ${error.message}`);
            next(error);
        }
    },

    // 13. Get City Count Only
    getCityCount: async (req, res, next) => {
        try {
            let { city_status } = req.params;
            if (city_status == null) throw createError.BadRequest();
            let count = 0;
            count = await db.City.count({
                where: { city_status },
            }).catch((err) => {
                throw createError.InternalServerError(err.message);
            });
            res.send({ count });
        } catch (error) {
            logger.error(`Error at Get City Count Only : ${error.message}`);
            next(error);
        }
    }
};
