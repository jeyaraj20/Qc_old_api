const SchoolOperatorRoute = require("express").Router();
const SchoolOperatorController = require("../controllers/SchoolOperator.controller");
const auth = require("../Middlewares/auth");

//-------------------------- Operator Route Start ------------------------------//

// 1. Get All Active Operator
SchoolOperatorRoute.get("/:status",auth, SchoolOperatorController.getAllActiveSchoolOperator);

// 2. Get All Inactive Operator
SchoolOperatorRoute.get("/inactive/",auth, SchoolOperatorController.getAllInactiveSchoolOperator);

// 3. Get Operator By Id
SchoolOperatorRoute.get("/:opId",auth, SchoolOperatorController.getSchoolOperatorById);

// 4. Create Operator
SchoolOperatorRoute.post("/",auth, SchoolOperatorController.createSchoolOperator);

// 5. Update Operator
SchoolOperatorRoute.put("/opId/:opId",auth, SchoolOperatorController.updateSchoolOperatorById);

// 6. Update 'Inactive / Active / Delete'
SchoolOperatorRoute.put("/inactive",auth, SchoolOperatorController.updateInactiveById);

SchoolOperatorRoute.get("/getoperator/:status",auth, SchoolOperatorController.getAllOperator);

//-------------------------- Operator Route End -----------------------------------//

module.exports = SchoolOperatorRoute;
