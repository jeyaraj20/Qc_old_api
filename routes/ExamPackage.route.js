const ExamPackageRoute = require("express").Router();
const ExamPackageController = require("../controllers/ExamPackage.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Exam Package Route Start ------------------------------//

// 1. Get All Exam Package
ExamPackageRoute.get("/status/:status", ExamPackageController.getAllExamPackage);

ExamPackageRoute.post("/", auth, ExamPackageController.createExamPackage);

ExamPackageRoute.put("/id/:package_id", auth, ExamPackageController.updateExamPackage);

ExamPackageRoute.put("/status",auth, ExamPackageController.updateStatusById);

ExamPackageRoute.get("/duration", ExamPackageController.getAllDurations);

ExamPackageRoute.get("/examduration/:package_id", ExamPackageController.getExamDurations);

//-------------------------- Exam Package Route End -----------------------------------//

module.exports = ExamPackageRoute;
