const SchoolStudentRoute = require("express").Router();
const SchoolStudentController = require("../controllers/SchoolStudent.controller");
const auth = require("../Middlewares/auth");
//-------------------------- SchoolStudent Route Start -----------------------------------//

// 1. Get All Student
SchoolStudentRoute.get("/status/:stud_status",auth, SchoolStudentController.getAllStudent);

// 2. Get Student By Id
SchoolStudentRoute.post("/school/id",auth, SchoolStudentController.getStudentById);

// 3. Create Many Student
SchoolStudentRoute.post("/school/create-many",auth, SchoolStudentController.createBulkStudent);

// 4. Update Student
SchoolStudentRoute.put("/school/stud-id/:id",auth, SchoolStudentController.updateStudent);

// 5. Update 'Inactive / Active / Delete'
SchoolStudentRoute.put("/school/stud-status",auth, SchoolStudentController.updateStatus);

// 6. Create Multi Student (Excel Upload)
//SchoolStudentRoute.post("/create/excel-file/", SchoolStudentController.createBulkStudent);

// 6. Read Multi Student (Excel Upload)
SchoolStudentRoute.post("/read/excel-file/",auth, SchoolStudentController.readBulkStudent);

// 7. Get Multi Student (Excel Upload Format File)
SchoolStudentRoute.get("/get/excel-file/",auth, SchoolStudentController.getSampleExcelFile);

// 8. Create One Student
SchoolStudentRoute.post("/create-one",auth, SchoolStudentController.createStudent);

//-------------------------- Student Route End -----------------------------------//

module.exports = SchoolStudentRoute;
