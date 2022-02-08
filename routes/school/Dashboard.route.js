const DashboardRoute = require("express").Router();
const DashboardController = require("../../controllers/school/Dashboard.controller");
const auth = require("../../Middlewares/userauth");

//-------------------------- Dashboard Route End -----------------------------------//

//  1. Results Summary
DashboardRoute.get("/all-results", auth, DashboardController.getAllResults);


DashboardRoute.get("/myexamresults", auth, DashboardController.getAllMyExamResults);

// 2. Performance Chart
DashboardRoute.get('/performance-chart', auth, DashboardController.getPerformanceChart);


DashboardRoute.get('/myexamperformance', auth, DashboardController.getMyExamPerformanceChart);



DashboardRoute.get("/get-profile/:stud_id", auth, DashboardController.getProfile);

// 8. Update Profile
DashboardRoute.put("/update/profile/:stud_id", auth, DashboardController.updateProfile);

//-------------------------- Dashboard Route End -----------------------------------//

module.exports = DashboardRoute;
