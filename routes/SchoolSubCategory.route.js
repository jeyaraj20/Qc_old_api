const SchoolSubCategoryRoute = require("express").Router();
const SchoolSubCategoryController = require("../controllers/SchoolSubCategory.controller");
const auth = require("../Middlewares/auth");
//-------------------------- SubCategory Route Start ------------------------------//

// 1. Get All Active SubCategory
SchoolSubCategoryRoute.get(
    "/status/:status",auth,
    SchoolSubCategoryController.getAllActiveSchoolSubCategory
);

// 2. Get All Inactive SubCategory
SchoolSubCategoryRoute.get(
    "/inactive",auth,
    SchoolSubCategoryController.getAllInActiveSchoolSubCategory
);

// 2. Create SubCategory By Id
SchoolSubCategoryRoute.post("/",auth, SchoolSubCategoryController.createSchoolSubCategoryById);

// 3. Get Sub Category By Id
SchoolSubCategoryRoute.get("/:catId",auth, SchoolSubCategoryController.getSchoolSubCategoryById);

// 4. Update Sub Category
SchoolSubCategoryRoute.put("/pid/:pid",auth, SchoolSubCategoryController.updateSchoolSubCategoryById);

// 5. Update 'Inactive'
SchoolSubCategoryRoute.put("/inactive",auth, SchoolSubCategoryController.updateInactiveById);

// 6. Update 'Delete'
SchoolSubCategoryRoute.delete("/",auth, SchoolSubCategoryController.updateSchoolDeleteById);

// 7. Get QBank Sub Category Count Only
SchoolSubCategoryRoute.get("/qbank-sub/count/:cat_status", auth, SchoolSubCategoryController.getSchoolSubCategoryCount);

SchoolSubCategoryRoute.get("/subcat/status/:status", auth, SchoolSubCategoryController.getAllActiveSubCategoryAlone);


SchoolSubCategoryRoute.get("/sub/:catId", auth, SchoolSubCategoryController.getSubCategoryByCatId);

SchoolSubCategoryRoute.post("/search-criteria/", auth, SchoolSubCategoryController.getSearchResult);

//-------------------------- SubCategory Route End -----------------------------------//

module.exports = SchoolSubCategoryRoute;
