const SchoolExamQuestionRoute = require("express").Router();
const SchoolExamQuestionController = require("../controllers/SchoolExamquestion.controller");
const auth = require("../Middlewares/auth");

//-------------------------- ExamQuestion Route Start -----------------------------------//

// 1. Create ExamQuestion (Assign)
SchoolExamQuestionRoute.post("/",auth, SchoolExamQuestionController.createSchoolExamQuestion);

// 2. Get Assigned Question Count
SchoolExamQuestionRoute.get("/",auth, SchoolExamQuestionController.getAssignedSchoolExamQuestionsCount);


SchoolExamQuestionRoute.post("/bank",auth, SchoolExamQuestionController.createSchoolBankExamQuestion);


SchoolExamQuestionRoute.post("/getassinged",auth, SchoolExamQuestionController.getAssignedSchoolExamQuestions);

SchoolExamQuestionRoute.post("/getassingedcount",auth, SchoolExamQuestionController.getAssignedExamQuestionsCount);

SchoolExamQuestionRoute.put("/",auth, SchoolExamQuestionController.removeAssignedSchoolQuestion);
//-------------------------- ExamQuestion Route End ------------------+------------------//

module.exports = SchoolExamQuestionRoute;
