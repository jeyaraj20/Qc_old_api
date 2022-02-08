const db = require("../Models");
const createError = require("http-errors");
const { Op } = require("sequelize");
const logger = require("../helper/adminLogger");

module.exports = {
    // 1. Get All Active Adminmenu Old
    getAllActiveAdminmenuOld: async (req, res, next) => {
        try {
            const { count, rows } = await db.Adminmenu.findAndCountAll({
                where: { menu_status: "Y" },
                order: [["menu_pos"]],
            });

            if (!rows) {
                throw createError.NotFound("Adminmenu Not Found !!!");
            }
            res.send({ count, Adminmenu: rows });
        } catch (error) {
            logger.error(`Error at Get All Active Adminmenu Old : ${error.message}`);
            next(error);
        }
    },

    // Get Usermenu
    getUserMenu: async (req, res, next) => {
        try {
            let logintype = req.user.logintype;
            let type = req.user.type;
            if (type == "S") {
                const { count, rows } = await db.Adminmenuall.findAndCountAll({
                    where: {
                        menu_status: "Y",
                        [Op.or]: [{ menu_for: "B" }, { menu_for: logintype }],
                    },
                    order: [["menu_pos"]],
                });

                if (!rows) {
                    throw createError.NotFound("Adminmenu Not Found !!!");
                }
                res.send({ count, Adminmenu: rows });
            } else {
                let op_id = req.user.userid;
                let tablename;
                if (logintype == "G") tablename = "tbl__operator";
                else tablename = "tbl__school_operator";
                const [Adminmenu] = await db.sequelize.query(
                    `select b.* from ` +
                        tablename +
                        ` as a 
                inner join tbl__adminmenu_all as b on FIND_IN_SET(b.menu_id, a.feat_id) > 0
                where a.op_id=? and b.menu_status='Y' 
                group by b.menu_id `,
                    { replacements: [op_id] }
                );

                if (!Adminmenu) throw createError.NotFound("Menu Not Found !!!");
                res.send({ count: Adminmenu.length, Adminmenu });
            }
        } catch (error) {
            logger.error(`Error at Get User Menu : ${error.message}`);
            next(error);
        }
    },

    // Get All Active Adminmenu
    getAllActiveAdminmenu: async (req, res, next) => {
        try {
            let logintype = req.user.logintype;
            const [Adminmenu] = await db.sequelize.query(
                `select * from tbl__adminmenu_all 
                where menu_status='Y' and (menu_for='B'
                 or menu_for='` +
                    logintype +
                    `') `,
                { replacements: [logintype] }
            );

            if (!Adminmenu) throw createError.NotFound("Menu Not Found !!!");
            res.send({ count: Adminmenu.length, Adminmenu });
        } catch (error) {
            logger.error(`Error at Get All Active Adminmenu : ${error.message}`);
            next(error);
        }
    },

    // Update Password Super Admin
    updatePasswordSuperAdmin: async (req, res, next) => {
        try {
            let { oldpassword, newpassword, type, logintype } = req.body;
            const password = Buffer.from(oldpassword).toString("base64");
            console.log(req.user);
            if (type == "S" && logintype == "G") {
                const { count, rows } = await db.Admin.findAndCountAll({
                    where: {
                        admin_id: req.user.userid,
                        admin_pass: password,
                        admin_status: "Y",
                    },
                });

                if (count > 0) {
                    const newpasswordupdate = Buffer.from(newpassword).toString("base64");
                    await db.Admin.update(
                        { admin_pass: newpasswordupdate },
                        { where: { admin_id: req.user.id } }
                    )
                        .then((result) => res.send({ message: "Updated Success" }))
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                } else {
                    throw createError.InternalServerError("Wrong Old Passoword");
                }
            }
            if (type == "S" && logintype == "I") {
                const { count, rows } = await db.School.findAndCountAll({
                    where: {
                        id: req.user.schoolid,
                        password: password,
                        schoolStatus: "Y",
                    },
                });

                if (count > 0) {
                    const newpasswordupdate = Buffer.from(newpassword).toString("base64");
                    await db.School.update(
                        { password: newpasswordupdate },
                        { where: { id: req.user.id } }
                    )
                        .then((result) => res.send({ message: "Updated Success" }))
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                } else {
                    throw createError.InternalServerError("Wrong Old Passoword");
                }
            }
        } catch (error) {
            logger.error(`Error at Update Password Superadmin : ${error.message}`);
            next(error);
        }
    },

    // Update Password Operator
    updatePasswordAdminOperator: async (req, res, next) => {
        try {
            let { oldpassword, newpassword, type, logintype } = req.body;
            const password = Buffer.from(oldpassword).toString("base64");

            if (type != "S" && logintype == "G") {
                const { count, rows } = await db.Operator.findAndCountAll({
                    where: {
                        op_id: req.user.userid,
                        op_password: password,
                        op_status: "Y",
                    },
                });

                if (count > 0) {
                    const newpasswordupdate = Buffer.from(newpassword).toString("base64");
                    await db.Operator.update(
                        { op_password: newpasswordupdate },
                        { where: { op_id: req.user.id } }
                    )
                        .then((result) => res.send({ message: "Updated Success" }))
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                } else {
                    throw createError.InternalServerError("Wrong Old Passoword");
                }
            }
            if (type != "S" && logintype == "I") {
                const { count, rows } = await db.SchoolOperator.findAndCountAll({
                    where: {
                        schoolid: req.user.schoolid,
                        op_password: password,
                        op_status: "Y",
                    },
                });

                if (count > 0) {
                    const newpasswordupdate = Buffer.from(newpassword).toString("base64");
                    await db.SchoolOperator.update(
                        { op_password: newpasswordupdate },
                        { where: { schoolid: req.user.schoolid, op_id: req.user.userid } }
                    )
                        .then((result) => res.send({ message: "Updated Success" }))
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                } else {
                    throw createError.InternalServerError("Wrong Old Passoword");
                }
            }
        } catch (error) {
            logger.error(`Error at Update Passwored Operator : ${error.message}`);
            next(error);
        }
    },
};
