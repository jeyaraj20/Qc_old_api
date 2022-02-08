const SchoolReportRoute = require("express").Router();
const SchoolReportController = require("../controllers/SchoolReports.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Adminmenu Route Start ------------------------------//

SchoolReportRoute.post("/report", SchoolReportController.getReports);

SchoolReportRoute.post("/mainreport", SchoolReportController.getMainReports);

SchoolReportRoute.post("/testreport", SchoolReportController.getTestReports);

SchoolReportRoute.post("/overallmaster", SchoolReportController.getOverallMasters);

SchoolReportRoute.post("/studentReport", SchoolReportController.getStudentReport);

SchoolReportRoute.post("/studentQCReport", SchoolReportController.getStudentQCReport);

//-------------------------- Adminmenu Route End -----------------------------------//

module.exports = SchoolReportRoute;