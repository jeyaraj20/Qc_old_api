const OperatorRoute = require("express").Router();
const OperatorController = require("../controllers/Operator.controller");
const auth = require("../Middlewares/auth");

//-------------------------- Operator Route Start ------------------------------//

// 1. Get All Active Operator
OperatorRoute.get("/:status",auth, OperatorController.getAllActiveOperator);

// 2. Get All Inactive Operator
OperatorRoute.get("/inactive/",auth, OperatorController.getAllInactiveOperator);

// 3. Get Operator By Id
OperatorRoute.get("/:opId",auth, OperatorController.getOperatorById);

// 4. Create Operator
OperatorRoute.post("/",auth, OperatorController.createOperator);

// 5. Update Operator
OperatorRoute.put("/opId/:opId",auth, OperatorController.updateOperatorById);

// 6. Update 'Inactive / Active / Delete'
OperatorRoute.put("/inactive",auth, OperatorController.updateInactiveById);

// 7. Get Operators Count Only
OperatorRoute.get("/opt-count/:op_status",auth, OperatorController.getOperatorsCount);

OperatorRoute.get("/getoperator/:status",auth, OperatorController.getAllOperator);

//-------------------------- Operator Route End -----------------------------------//

module.exports = OperatorRoute;
