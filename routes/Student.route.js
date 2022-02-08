const StudentRoute = require("express").Router();
const StudentController = require("../controllers/Student.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Student Route Start -----------------------------------//

// 1. Get All Active Student
StudentRoute.get("/status/:stud_status",auth, StudentController.getAllStudent);

// 2. Get Student By Id
StudentRoute.get("/id/:stud_id",auth, StudentController.getStudentById);

// 3. Create Student
StudentRoute.post("/",auth, StudentController.createStudent);

// 4. Update Student
StudentRoute.put("/id/:stud_id",auth, StudentController.updateStudentById);

// 5. Update 'Inactive / Active / Delete'
StudentRoute.put("/status",auth, StudentController.updateStatusById);

// 6. Get Students Count Only
StudentRoute.get("/stud-count/:stud_status",auth, StudentController.getStudentsCount);

//-------------------------- Student Route End -----------------------------------//

module.exports = StudentRoute;
