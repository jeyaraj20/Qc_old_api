const ExamQuestionRoute = require("express").Router();
const ExamQuestionController = require("../controllers/Examquestion.controller");
const auth = require("../Middlewares/auth");

//-------------------------- ExamQuestion Route Start -----------------------------------//

// 1. Create ExamQuestion (Assign)
ExamQuestionRoute.post("/",auth, ExamQuestionController.createExamQuestion);

// 2. Get Assigned Question Count


ExamQuestionRoute.post("/bank",auth, ExamQuestionController.createBankExamQuestion);


ExamQuestionRoute.post("/getassinged",auth, ExamQuestionController.getAssignedExamQuestions);

ExamQuestionRoute.post("/getassingedcount",auth, ExamQuestionController.getAssignedExamQuestionsCount);

ExamQuestionRoute.put("/",auth, ExamQuestionController.removeAssignedQuestion);
//-------------------------- ExamQuestion Route End -----------------------------------//

module.exports = ExamQuestionRoute;
