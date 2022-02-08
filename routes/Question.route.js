const QuestionRoute = require("express").Router();
const QuestionController = require("../controllers/Question.controller");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const auth = require("../Middlewares/auth");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure Questions Directory directory exists
var homeCategoryDir = path.join(process.env.questions);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.questions);
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
QuestionRoute.post("/get/status", auth, QuestionController.getAllQuestion);

// 2. Get Question By Sub Category Id
QuestionRoute.get("/subId/:sub_id", auth, QuestionController.getQuestionByCategories);

// 2. Get Question By Id
QuestionRoute.get("/qId/:qId", auth, QuestionController.getQuestionById);

// 3. Create Question
QuestionRoute.post("/", auth, QuestionController.createQuestion);

// 4. Update Question
QuestionRoute.put("/qid/:qId", auth, QuestionController.updateQuestionById);

// 5. Question Count
QuestionRoute.post("/questionNo", auth, QuestionController.getQuestionNo);

// 6. Update 'Active / Inactive / Delete'
QuestionRoute.put("/inactive", auth, QuestionController.updateStatusById);

// 7. Get Dashboard Count
QuestionRoute.get("/dashboard/count", auth, QuestionController.getQuestionsCount);

QuestionRoute.post("/view", auth, QuestionController.getAllocateQuestion);

QuestionRoute.post("/totalcount", auth, QuestionController.getAllocateQuestionTotalCount);

// 9. Question Search Result
QuestionRoute.post("/search-criteria/", auth, QuestionController.getSearchResult);

// 10. Get Questions Count Only
QuestionRoute.post("/active-inactive/count/", auth, QuestionController.getQuestionsCountOnly);

QuestionRoute.post("/getcategory", auth, QuestionController.getCategoryName);

// 12. Create Passage Question
QuestionRoute.post("/passage", auth, QuestionController.createPassageQuestions);

// 13. Get Passage Question
QuestionRoute.get('/passage/qid/:qid', auth, QuestionController.getPassageQuestionById);

// 14. Update Passage Question
QuestionRoute.put("/passage/:qid", auth, QuestionController.updatePassageQuestions);

// 15. Delete Passage Question
QuestionRoute.get("/passage/delete/qid/:qid", auth, QuestionController.deletePassageQuestions);

//-------------------------- Question Route End -----------------------------------//

module.exports = QuestionRoute;