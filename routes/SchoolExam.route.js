const SchoolExamRoute = require("express").Router();
const SchoolExamController = require("../controllers/SchoolExam.controller");
const auth = require("../Middlewares/auth");
//-------------------------- SchoolExam Route Start -----------------------------------//

// 1. Get All Exam By Status
SchoolExamRoute.post("/", auth, SchoolExamController.getAllSchoolExam);

// 2. Get Exam By Id
SchoolExamRoute.get("/id/:id", auth, SchoolExamController.getSchoolExamById);

// 3. Create Common Exam
SchoolExamRoute.post("/create", auth, SchoolExamController.createSchoolExam);

// 4. Create Bank Exam
SchoolExamRoute.post("/bexam", auth, SchoolExamController.createSchoolBankExam);

// 5. Update Exam
SchoolExamRoute.put("/id/:id", auth, SchoolExamController.updateSchoolExamById);

// 6. Update Bank Exam
SchoolExamRoute.put("/bexam/id/:id", auth, SchoolExamController.updateSchoolBankExamById);

// 7. Update Exam Status 'Inactive / Active / Delete'
SchoolExamRoute.put("/status", auth, SchoolExamController.updateSchoolStatusById);

SchoolExamRoute.post("/previousyear/", auth, SchoolExamController.getSchoolPreviousYear);

SchoolExamRoute.get("/getTestTypes/:sub_cat_id", auth, SchoolExamController.getSchoolTestTypes);

SchoolExamRoute.get("/getChapters/:sub_cat_id", auth, SchoolExamController.getSchoolChapters);


SchoolExamRoute.get("/getTestTypesEdit/:sub_cat_id", auth, SchoolExamController.getSchoolTestTypesEdit);

SchoolExamRoute.get("/getChaptersEdit/:sub_cat_id", auth, SchoolExamController.getSchoolChaptersEdit);

SchoolExamRoute.get("/getSection/:exam_id", auth, SchoolExamController.getSchoolSection);

SchoolExamRoute.post("/examcount", auth, SchoolExamController.getAllExamCount);

SchoolExamRoute.post("/assignedcount", auth, SchoolExamController.getAllExamWithAssignedcount);

SchoolExamRoute.get("/getExamResutlReport/:schoolId", auth, SchoolExamController.getExamResutlReport);

SchoolExamRoute.get("/examDownloadPdf", auth, SchoolExamController.examDownload);

//-------------------------- SchoolExam Route End -----------------------------------//

module.exports = SchoolExamRoute;
