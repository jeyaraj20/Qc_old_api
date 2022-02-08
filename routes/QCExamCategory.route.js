const QCExamCategoryRoute = require("express").Router();
const QCExamCategoryController = require("../controllers/QCExamCategory.controller");
const auth = require("../Middlewares/auth");

QCExamCategoryRoute.get("/master", auth, QCExamCategoryController.getQcMasterCategory);

QCExamCategoryRoute.get("/main", auth, QCExamCategoryController.getQcMainCategory);

QCExamCategoryRoute.get("/sub", auth, QCExamCategoryController.getQcSubCategory);

QCExamCategoryRoute.get("/chapter", auth, QCExamCategoryController.getQcChapters);

module.exports = QCExamCategoryRoute;