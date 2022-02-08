const SchoolExamMainCategoryRoute = require("express").Router();
const SchoolExamMainCategoryController = require("../controllers/SchoolExamMainCategory.controller");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const auth = require("../Middlewares/auth");
require("dotenv").config();

//-------------------------- Multer Part Start --------------------------------------//

// Ensure ExamMainCategory Directory directory exists
var schoolexamMainCategoryDir = path.join(process.env.schoolExamCategory);
fs.existsSync(schoolexamMainCategoryDir) || fs.mkdirSync(schoolexamMainCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.schoolExamCategory);
    },
    filename: (req, file, callBack) => {
        callBack(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10000000, files: 1 },
});

//-------------------------- Multer Part End -------------------------------------------//

//-------------------------- Exam Main Category Route Start ------------------------------//

// 1. Get All Master Category
SchoolExamMainCategoryRoute.get(
    "/master",
    auth,
    SchoolExamMainCategoryController.getAllSchoolMasterCategory
);

SchoolExamMainCategoryRoute.get(
    "/main/:masterId",
    auth,
    SchoolExamMainCategoryController.getAllSchoolMainCategory
);

SchoolExamMainCategoryRoute.get(
    "/sub/:mainId",
    auth,
    SchoolExamMainCategoryController.getAllSchoolSubCategory
);

SchoolExamMainCategoryRoute.post(
    "/",
    auth,
    upload.single("exa_cat_image_url"),
    SchoolExamMainCategoryController.createSchoolExamMainCategory
);

SchoolExamMainCategoryRoute.get(
    "/:status",
    auth,
    SchoolExamMainCategoryController.getAllSchoolExamMainCategory
);

SchoolExamMainCategoryRoute.put(
    "/catId/:catId",
    auth,
    upload.single("exa_cat_image_url"),
    SchoolExamMainCategoryController.updateSchoolExamMainCategoryById
);

SchoolExamMainCategoryRoute.get(
    "/catId/:catId",
    auth,
    SchoolExamMainCategoryController.getSchoolExamMainCategoryById
);

SchoolExamMainCategoryRoute.put(
    "/inactive",
    auth,
    SchoolExamMainCategoryController.updateSchoolInactiveById
);

SchoolExamMainCategoryRoute.put(
    "/position",
    auth,
    SchoolExamMainCategoryController.updateSchoolPositionById
);

SchoolExamMainCategoryRoute.get("/chapter/:subId" , SchoolExamMainCategoryController.getAllExamChapters);

//-------------------------- Exam Main Category Route End -----------------------------------//

module.exports = SchoolExamMainCategoryRoute;
