const ExamMainCategoryRoute = require("express").Router();
const ExamMainCategoryController = require("../controllers/ExamMainCategory.controller");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const auth = require("../Middlewares/auth");
require("dotenv").config();

//-------------------------- Multer Part Start --------------------------------------//

// Ensure ExamMainCategory Directory directory exists
var examMainCategoryDir = path.join(process.env.examCategory);
fs.existsSync(examMainCategoryDir) || fs.mkdirSync(examMainCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.examCategory);
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
ExamMainCategoryRoute.get("/master", auth, ExamMainCategoryController.getAllMasterCategory);

//  2. Get All Main Category
ExamMainCategoryRoute.get("/main/:masterId", auth, ExamMainCategoryController.getAllMainCategory);

// Get All Sub Category
ExamMainCategoryRoute.get("/sub/:catId", auth, ExamMainCategoryController.getAllSubCategory);

// 3. Get All Main Category By Status
ExamMainCategoryRoute.get("/:status", auth, ExamMainCategoryController.getAllExamMainCategory);

// 2. Get All Inactive Exam Main Category
// ExamMainCategoryRoute.get(
//     "/inactive",
//     ExamMainCategoryController.getAllInactiveExamMainCategory
// );

// 3. Get Home Category By Id
ExamMainCategoryRoute.get(
    "/catId/:catId",
    auth,
    ExamMainCategoryController.getExamMainCategoryById
);

// 4. Get Home Category By Position No
ExamMainCategoryRoute.get(
    "/position/:position",
    auth,
    ExamMainCategoryController.getExamMainCategoryByPosition
);

// 5. Create Home Category
ExamMainCategoryRoute.post(
    "/",
    auth,
    upload.single("exa_cat_image_url"),
    ExamMainCategoryController.createExamMainCategory
);

// 6. Update Home Category
ExamMainCategoryRoute.put(
    "/catId/:catId",
    upload.single("exa_cat_image_url"),
    ExamMainCategoryController.updateExamMainCategoryById
);

// 7. Update 'Active / Inactive / Delete'
ExamMainCategoryRoute.put("/inactive" , ExamMainCategoryController.updateInactiveById);

// 8. Update 'Position'
ExamMainCategoryRoute.put("/position" , ExamMainCategoryController.updatePositionById);

ExamMainCategoryRoute.put("/bulkUpdateMasterCat" , ExamMainCategoryController.bulkUpdateMasterCat);

// 9. Get Exam Main Category Count Only
ExamMainCategoryRoute.get(
    "/main-cat/count/:exa_cat_status",
    auth,
    ExamMainCategoryController.getExamMainCount
);

ExamMainCategoryRoute.get("/category/:exacatid" , ExamMainCategoryController.getHomeMasterCategory);

ExamMainCategoryRoute.get("/chapter/:subId" , ExamMainCategoryController.getAllExamChapters);

//-------------------------- Exam Main Category Route End -----------------------------------//

module.exports = ExamMainCategoryRoute;
