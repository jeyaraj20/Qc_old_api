const ExamNewRoute = require("express").Router();
const ExamNewController = require("../../controllers/school/ExamNew.controller");
const auth = require("../../Middlewares/userauth");

//-------------------------- User Exam Route End -----------------------------------//

//  1. Exam taken
ExamNewRoute.post("/examtaken", auth, ExamNewController.setExamTaken);

// 2. Exam taken by takenid
ExamNewRoute.get("/examtaken/:taken_id", auth, ExamNewController.getExamTaken);

// 3. Exam Result
ExamNewRoute.post("/examresult", auth, ExamNewController.setExamResult);

// 4. Save result
ExamNewRoute.post("/saveresult", auth, ExamNewController.saveExamResult);

// 5. Get Reslt
ExamNewRoute.get("/getResult/:taken_id", auth, ExamNewController.getResult);

// 6. Get Exam Name
ExamNewRoute.get("/getExamName/:exam_id", auth, ExamNewController.getExamName);

ExamNewRoute.get("/getDate", auth, ExamNewController.getDate);

ExamNewRoute.get("/examtakenanswer/:taken_id", auth, ExamNewController.getExamTakenAnswer);

ExamNewRoute.get("/examcomplete/:taken_id", auth, ExamNewController.getExamComplete);


ExamNewRoute.get("/getSectionResult/:taken_id", auth, ExamNewController.getSectionResult);

ExamNewRoute.get("/id/:id", auth, ExamNewController.getExamById);


//-------------------------- User Exam Route End -----------------------------------//

module.exports = ExamNewRoute;
