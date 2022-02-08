const SchoolRoute = require("express").Router();
const SchoolController = require("../controllers/School.controller");
const auth = require("../Middlewares/auth");

//-------------------------- School Route Start -----------------------------------//

// 1. Get All Active School
SchoolRoute.get("/status/:schoolStatus",auth, SchoolController.getAllSchool);

// 2. Get School By Id
SchoolRoute.get("/id/:id",auth, SchoolController.getSchoolById);

// 3. Create School
SchoolRoute.post("/",auth, SchoolController.createSchool);

// 4. Update School
SchoolRoute.put("/id/:id",auth, SchoolController.updateSchoolById);

// 5. Update 'Inactive / Active / Delete'
SchoolRoute.put("/status",auth, SchoolController.updateStatusById);

// 6. Get Schools Count Only
SchoolRoute.get("/sch-count/:schoolStatus",auth, SchoolController.getSchoolsCount);


//-------------------------- School Route End -----------------------------------//

module.exports = SchoolRoute;
