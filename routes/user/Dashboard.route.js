const DashboardRoute = require("express").Router();
const DashboardController = require("../../controllers/user/Dashboard.controller");
const auth = require("../../Middlewares/userauth");

//-------------------------- Dashboard Route End -----------------------------------//

//  1. Results Summary
DashboardRoute.get("/all-results", auth, DashboardController.getAllResults);

// 2. Performance Chart
DashboardRoute.get("/performance-chart", auth, DashboardController.getPerformanceChart);

// 3. Search
DashboardRoute.get("/search-page/category", auth, DashboardController.getSearchResult);

//-------------------------- Dashboard Route End -----------------------------------//

module.exports = DashboardRoute;
