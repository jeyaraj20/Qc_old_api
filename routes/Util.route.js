const UtilRoute = require("express").Router();
const UtilController = require("../controllers/Util.controller");
const auth = require("../Middlewares/auth");

//-------------------------- Utility Route Start -----------------------------------//

// 1. Get Settings
UtilRoute.post("/getcountbyfield",auth, UtilController.getByField);

UtilRoute.post("/validateexammaincat",auth, UtilController.getByFieldForExamCategory);

UtilRoute.post("/validateexamsubcat",auth, UtilController.getByFieldForExamSubCategory);

// 4. Exam Calender Download
UtilRoute.get("/download-pdf", (req, res, next) => {
    res.download(__dirname + '../../public/examcalender.pdf', 'test.pdf');
});

//-------------------------- Utility Route Start -----------------------------------//

module.exports = UtilRoute;
