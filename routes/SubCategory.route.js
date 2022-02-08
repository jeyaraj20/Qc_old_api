const SubCategoryRoute = require("express").Router();
const SubCategoryController = require("../controllers/SubCategory.controller");
const auth = require("../Middlewares/auth");
//-------------------------- SubCategory Route Start ------------------------------//

// 1. Get All Active SubCategory
SubCategoryRoute.get("/status/:status", auth, SubCategoryController.getAllActiveSubCategory);

SubCategoryRoute.get("/subcat/status/:status", auth, SubCategoryController.getAllActiveSubCategoryAlone);

// 2. Get All Inactive SubCategory
SubCategoryRoute.get("/inactive", auth, SubCategoryController.getAllInActiveSubCategory);

// 2. Create SubCategory By Id
SubCategoryRoute.post("/", auth, SubCategoryController.createSubCategoryById);

// 3. Get Sub Category By Id
SubCategoryRoute.get("/:catId", auth, SubCategoryController.getSubCategoryById);

// 4. Update Sub Category
SubCategoryRoute.put("/pid/:pid", auth, SubCategoryController.updateSubCategoryById);

// 5. Update 'Inactive'
SubCategoryRoute.put("/inactive", auth, SubCategoryController.updateInactiveById);

// 6. Update 'Delete'
SubCategoryRoute.delete("/", auth, SubCategoryController.updateDeleteById);

// 7. Exam Sub Category Search Result
SubCategoryRoute.post("/search-criteria/", auth, SubCategoryController.getSearchResult);

// 8. Get QBank Sub Category Count Only
SubCategoryRoute.get("/qbank-sub/count/:cat_status", auth, SubCategoryController.getSubCategoryCount);

// 9. Get Sub Category By Category Id
SubCategoryRoute.get("/sub/:catId", auth, SubCategoryController.getSubCategoryByCatId);

SubCategoryRoute.post("/get/Questionspdf", SubCategoryController.getQuestionspdf);
SubCategoryRoute.post("/get/Questionspdfreport", SubCategoryController.getQuestionPDFreport);

SubCategoryRoute.post("/get/ExamQuestionpdf", SubCategoryController.getExamQuestionspdf);

SubCategoryRoute.put("/position", auth, SubCategoryController.updatePositionById);

SubCategoryRoute.post("/get/alladmin", SubCategoryController.getAllAdmin);

SubCategoryRoute.post("/get/alladminquestions", SubCategoryController.getAllAdminQuestions);

//-------------------------- SubCategory Route End -----------------------------------//

module.exports = SubCategoryRoute;