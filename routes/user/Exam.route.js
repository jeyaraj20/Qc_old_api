const ExamRoute = require("express").Router();
const ExamController = require("../../controllers/user/Exam.controller");
const auth = require("../../Middlewares/userauth");

//-------------------------- User Exam Route End -----------------------------------//

//  1. Exam taken
ExamRoute.post("/examtaken", auth, ExamController.setExamTaken);

// 2. Exam taken by takenid
ExamRoute.get("/examtaken/:taken_id", auth, ExamController.getExamTaken);

// 3. Exam Result
ExamRoute.post("/examresult", auth, ExamController.setExamResult);

ExamRoute.post("/removeexamresult", auth, ExamController.removeExamResult);

// 4. Save result
ExamRoute.post("/saveresult", auth, ExamController.saveExamResult);

// 5. Get Reslt
ExamRoute.get("/getResult/:taken_id/:smsFlag?", auth, ExamController.getResult);

// 6. Get Exam Name
ExamRoute.get("/getExamName/:exam_id", auth, ExamController.getExamName);

ExamRoute.get("/getDate", auth, ExamController.getDate);

ExamRoute.get("/examtakenanswer/:taken_id", auth, ExamController.getExamTakenAnswer);

ExamRoute.get("/examcomplete/:taken_id", auth, ExamController.getExamComplete);

// Get Sectionwise Reslt
ExamRoute.get("/getSectionResult/:taken_id", auth, ExamController.getSectionResult);

ExamRoute.get("/id/:id", auth, ExamController.getExamById);

ExamRoute.post("/sendmessage", auth, ExamController.sendmessage);
//-------------------------- User Exam Route End -----------------------------------//

module.exports = ExamRoute;
