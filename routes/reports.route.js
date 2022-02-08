const ReportRoute = require("express").Router();
const ReportController = require("../controllers/report.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Adminmenu Route Start ------------------------------//

// 1. Get All Active Adminmenu
ReportRoute.post("/report", ReportController.getReports);
ReportRoute.post("/reportpdf", ReportController.getReportsNew);

ReportRoute.post("/mainreport", ReportController.getMainReports);
ReportRoute.post("/mainreportpdf", ReportController.getMainReportsNew);

ReportRoute.post("/testreport", ReportController.getTestReports);
ReportRoute.post("/testreportpdf", ReportController.getTestReportsNew);

ReportRoute.post("/overallmaster", ReportController.getOverallMasters);
ReportRoute.post("/overallmasterpdf", ReportController.getOverallMastersNew);

//-------------------------- Adminmenu Route End -----------------------------------//

module.exports = ReportRoute;