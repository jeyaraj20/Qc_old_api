const SchoolQuestionRoute = require("express").Router();
const SchoolQuestionController = require("../controllers/SchoolQuestion.controller");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const auth = require("../Middlewares/auth");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var homeCategoryDir = path.join(process.env.schoolQuestions);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.schoolQuestions);
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

//-------------------------- Multer Part End ---------------------------------------//

//-------------------------- Question Route Start ------------------------------//

// 1. Get All Question
SchoolQuestionRoute.post("/get/status", auth, SchoolQuestionController.getAllSchoolQuestion);



// 2. Get Question By Sub Category Id
SchoolQuestionRoute.get("/subId/:sub_id", auth, SchoolQuestionController.getSchoolQuestionByCategories);

// 3. Create Question
SchoolQuestionRoute.post("/", auth, SchoolQuestionController.createSchoolQuestion);


SchoolQuestionRoute.get("/questid/:qId", auth, SchoolQuestionController.getSchoolQuestionById);


// 4. Update Question
SchoolQuestionRoute.put("/qid/:qId", auth, SchoolQuestionController.updateSchoolQuestionById);

// 5. Question Count
SchoolQuestionRoute.post("/questionNo", auth, SchoolQuestionController.getSchoolQuestionNo);
// 6. Update 'Active / Inactive / Delete'
SchoolQuestionRoute.put("/inactive", auth, SchoolQuestionController.updateSchoolStatusById);
SchoolQuestionRoute.post("/view", auth, SchoolQuestionController.getAllocateSchoolQuestion);
// 7. Get Dashboard Count
SchoolQuestionRoute.get("/dashboard/count", auth, SchoolQuestionController.getSchoolQuestionsCount);

// 8. Get Questions Count Only
SchoolQuestionRoute.post("/active-inactive/count/", auth, SchoolQuestionController.getSchoolQuestionsCountOnly);

SchoolQuestionRoute.post("/totalcount", auth, SchoolQuestionController.getAllocateQuestionTotalCount);

SchoolQuestionRoute.post("/getcategory", auth, SchoolQuestionController.getCategoryName);

SchoolQuestionRoute.get("/qId/:qId", auth, SchoolQuestionController.getQuestionById);

module.exports = SchoolQuestionRoute;