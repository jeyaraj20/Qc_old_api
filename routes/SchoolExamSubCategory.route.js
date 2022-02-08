const SchoolExamSubCategoryRoute = require("express").Router();
const SchoolExamSubCategoryController = require("../controllers/SchoolExamSubCategory.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Exam Main Category Route Start ------------------------------//


SchoolExamSubCategoryRoute.get(
    "/status/:status",auth,
    SchoolExamSubCategoryController.getAllSchoolExamSubCategory
);
SchoolExamSubCategoryRoute.get(
    "/chapter/:exa_cat_id",auth,
    SchoolExamSubCategoryController.getAllSchoolExamSubCategoryChapter
);

SchoolExamSubCategoryRoute.get(
    "/type/:exa_cat_id",auth,
    SchoolExamSubCategoryController.getAllSchoolExamSubCategoryTypes
);

// 2. Create Exam Sub Category
SchoolExamSubCategoryRoute.post("/",auth, SchoolExamSubCategoryController.createSchoolExamSubCategory);


// 3. Get Exam Sub Category
SchoolExamSubCategoryRoute.get(
    "/id/:exa_cat_id",auth,
    SchoolExamSubCategoryController.getSchoolExamSubCategoryById
);

// 4. Update Exam Sub Category
SchoolExamSubCategoryRoute.put(
    "/id/:exa_cat_id",auth,
    SchoolExamSubCategoryController.updateSchoolExamSubCategory
);

// 5. Update 'Active / Inactive / Delete'
SchoolExamSubCategoryRoute.put("/status",auth, SchoolExamSubCategoryController.updateSchoolStatusById);

SchoolExamSubCategoryRoute.get(
    "/sub-cat/count/:exa_cat_status",
    auth,
    SchoolExamSubCategoryController.getExamSubCount
);


module.exports = SchoolExamSubCategoryRoute;