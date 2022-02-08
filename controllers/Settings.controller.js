const db = require("../Models");
const createError = require("http-errors");
const moment = require("moment");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const logger = require('../helper/adminLogger');
const { ImageFilter } = require("../helper/general_helper");
const unserialize = require("locutus/php/var/unserialize");
const serialize = require("locutus/php/var/serialize");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var homeCategoryDir = path.join(process.env.settings);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.settings);
    },
    filename: (req, file, callBack) => {
        callBack(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: ImageFilter,
    limits: { fileSize: "2mb" },
}).fields([
    {
        name: "setting_banner",
        maxCount: 1,
    },
]);

//-------------------------- Multer Part End ---------------------------------------//

module.exports = {
    // 1. Get Settings
    getSettings: async (req, res, next) => {
        try {
            const settings = await db.Admin.findByPk(1);
            if (!settings) {
                throw createError.NotFound("Settings Not Found !!!");
            }
            let { setting_fields } = settings;
            settings.setting_fields = unserialize(setting_fields);
            res.send({ settings });
        } catch (error) {
            logger.error(`Error at Get Settings : ${error.message}`);
            next(error);
        }
    },

    // 2. Update Settings
    updateSettings: async (req, res, next) => {
        try {
            console.log(req);
            upload(req, res, function (err) {
                if (req.fileValidationError) {
                    return res.send(req.fileValidationError);
                } else if (err instanceof multer.MulterError) {
                    return res.send(err);
                } else if (err) {
                    return res.send(err);
                } else {
                    console.log("Success", req.files);
                }
                const { file } = req;
                console.log(file);
                if (!file) throw createError.NotFound("No File");
                
                const {
                    admin_name,
                    admin_pass,
                    sitename,
                    set_url,
                    setting_fields,
                    type,
                    explanation,
                } = req.body;
                if (
                    !admin_name ||
                    !admin_pass ||
                    !sitename ||
                    !set_url ||
                    !setting_fields ||
                    !type ||
                    !explanation
                )
                    throw createError.BadRequest();
                const password = Buffer.from(admin_pass).toString("base64");
                db.sequelize.transaction(async (t) => {
                    await db.Admin.update(
                        {
                            admin_name,
                            admin_pass: password,
                            admin_status: "Y",
                            sitename,
                            set_url,
                            setting_fields: serialize(setting_fields),
                            setting_operator: "Y",
                            setting_logo: "",
                            setting_banner:
                                req.files.settingbanner[0].filename,
                            type,
                            explanation,
                            lastupdate: moment(Date.now()).format(
                                "YYYY-MM-DD HH:mm:ss"
                            ),
                        },
                        { where: { admin_id: 1 } },
                        { transaction: t }
                    )
                        .then((result) =>
                            res.send({ message: "Update Success" })
                        )
                        .catch((err) => {
                            throw createError.InternalServerError(err.message);
                        });
                });
            });
        } catch (error) {
            logger.error(`Error at Update Settings : ${error.message}`);
            next(error);
        }
    },
};
