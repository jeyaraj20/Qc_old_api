const SchoolOperatorRoute = require("express").Router();
const SchoolStaffAssignController = require("../controllers/SchoolStaffAssign.controller");
const auth = require("../Middlewares/auth");

//-------------------------- School Staff Assign Route Start ------------------------------//

// 1. Assign Staff
SchoolOperatorRoute.post("/",auth, SchoolStaffAssignController.assignSchoolStaff);

SchoolOperatorRoute.put("/id/:id",auth, SchoolStaffAssignController.updateSchoolStaff);

SchoolOperatorRoute.get("/allstaffassign",auth, SchoolStaffAssignController.getAllStaffAssign);

//-------------------------- School Staff Assign Route End -----------------------------------//

module.exports = SchoolOperatorRoute;
