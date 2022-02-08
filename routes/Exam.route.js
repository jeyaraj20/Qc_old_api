const ExamRoute = require("express").Router();
const ExamController = require("../controllers/Exam.controller");
const auth = require("../Middlewares/auth");

//-------------------------- Exam Route Start -----------------------------------//

// 1. Get All Exam By Status
ExamRoute.post("/", auth, ExamController.getAllExam);

ExamRoute.post("/examcount", auth, ExamController.getAllExamCount);
ExamRoute.post("/assignedcount", auth, ExamController.getAllExamWithAssignedcount);

// 2. Get Exam By Id
ExamRoute.get("/id/:id", auth, ExamController.getExamById);

// 3. Create Common Exam
ExamRoute.post("/create", auth, ExamController.createExam);

// 4. Create Bank Exam
ExamRoute.post("/bexam", auth, ExamController.createBankExam);

// 4.1. Create Sectional Exam
ExamRoute.post("/sexam", auth, ExamController.createSectionalExam);

// 5. Update Exam
ExamRoute.put("/id/:id", auth, ExamController.updateExamById);

// 6. Update Bank Exam
ExamRoute.put("/bexam/id/:id", auth, ExamController.updateBankExamById);

// 6.1. Update Section Exam
ExamRoute.put("/sexam/id/:id", auth, ExamController.updateSectionalExamById);

// 7. Update Exam Status 'Inactive / Active / Delete'
ExamRoute.put("/status", auth, ExamController.updateStatusById);

ExamRoute.post("/previousyear/", auth, ExamController.getPreviousYear);

ExamRoute.get("/getTestTypes/:sub_cat_id", auth, ExamController.getTestTypes);

ExamRoute.get("/getChapters/:sub_cat_id", auth, ExamController.getChapters);

ExamRoute.get("/getTestTypesEdit/:sub_cat_id", auth, ExamController.getTestTypesEdit);

ExamRoute.get("/getChaptersEdit/:sub_cat_id", auth, ExamController.getChaptersEdit);

ExamRoute.get("/getSection/:exam_id", auth, ExamController.getSection);

ExamRoute.post("/search-criteria/", auth, ExamController.getSearchResult);

// 15. Get All Exam Count Only
ExamRoute.post("/all-exam/count", auth, ExamController.getAllExamCount);

ExamRoute.post("/moveexam/", auth, ExamController.moveExam);

ExamRoute.get("/allattendexam", auth, ExamController.getAllAttendExam);

ExamRoute.get("/allpaidexam", auth, ExamController.getAllPaidExam);

ExamRoute.get("/getautomaticrows/:exam_id", auth, ExamController.getAutomaticRows);

ExamRoute.get("/examDownloadPdf", auth, ExamController.examDownload);

//-------------------------- Exam Route End -----------------------------------//

module.exports = ExamRoute;
