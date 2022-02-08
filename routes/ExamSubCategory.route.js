const ExamSubCategoryRoute = require("express").Router();
const ExamSubCategoryController = require("../controllers/ExamSubCategory.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Exam Main Category Route Start ------------------------------//

// 1. Get All Exam Sub Category
ExamSubCategoryRoute.get("/status/:status", ExamSubCategoryController.getAllExamSubCategory);

ExamSubCategoryRoute.get(
    "/chapter/:exa_cat_id",
    auth,
    ExamSubCategoryController.getAllExamSubCategoryChapter
);

ExamSubCategoryRoute.get(
    "/type/:exa_cat_id",
    auth,
    ExamSubCategoryController.getAllExamSubCategoryTypes
);

ExamSubCategoryRoute.post("/chapter", auth, ExamSubCategoryController.getChaptersBySubCatId);

// 2. Create Exam Sub Category
ExamSubCategoryRoute.post("/", auth, ExamSubCategoryController.createExamSubCategory);

// 3. Get Exam Sub Category
ExamSubCategoryRoute.get("/id/:exa_cat_id", auth, ExamSubCategoryController.getExamSubCategoryById);

// 4. Update Exam Sub Category
ExamSubCategoryRoute.put("/id/:exa_cat_id", auth, ExamSubCategoryController.updateExamSubCategory);

// 5. Update 'Active / Inactive / Delete'
ExamSubCategoryRoute.put("/status", auth, ExamSubCategoryController.updateStatusById);

// 7. Exam Sub Category Search Result
ExamSubCategoryRoute.post("/search-criteria/", auth, ExamSubCategoryController.getSearchResult);

// 8. Get Exam Sub Category Count Only
ExamSubCategoryRoute.get(
    "/sub-cat/count/:exa_cat_status",
    auth,
    ExamSubCategoryController.getExamSubCount
);

// 9. Exam Sub Category Questions Assign Search Criteria
ExamSubCategoryRoute.post(
    "/question/assign/search-criteria",
    auth,
    ExamSubCategoryController.questionAssignSearch
);

//-------------------------- Exam Main Category Route End -----------------------------------//

module.exports = ExamSubCategoryRoute;
