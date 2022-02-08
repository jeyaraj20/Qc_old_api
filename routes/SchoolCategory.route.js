const SchoolCategoryRoute = require("express").Router();
const SchoolCategoryController = require("../controllers/SchoolCategory.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Category Route Start ------------------------------//

// 1. Get All Active Category
SchoolCategoryRoute.get("/",auth, SchoolCategoryController.getAllActiveSchoolCategory);

SchoolCategoryRoute.get("/asc", auth, SchoolCategoryController.getAllSchoolCategoryByAsc);

// 2. Get All Inactive Category
SchoolCategoryRoute.get("/inactive/",auth, SchoolCategoryController.getAllInactiveSchoolCategory);

// 3. Get Category By Id
SchoolCategoryRoute.get("/:catId",auth, SchoolCategoryController.getSchoolCategoryById);

// 4. Get Category By Position No
SchoolCategoryRoute.get(
    "/position/:position",auth,
    SchoolCategoryController.getSchoolCategoryByPosition
);

// 5. Create Category
SchoolCategoryRoute.post("/",auth, SchoolCategoryController.createSchoolCategory);

// 6. Update Category
SchoolCategoryRoute.put("/catId/:catId",auth, SchoolCategoryController.updateSchoolCategoryById);

// 7. Update 'Inactive'
SchoolCategoryRoute.put("/inactive",auth, SchoolCategoryController.updateInactiveById);

// 8. Update 'Delete'
SchoolCategoryRoute.delete("/",auth, SchoolCategoryController.updateDeleteById);

// 9. Update 'Position'
SchoolCategoryRoute.put("/position",auth, SchoolCategoryController.updatePositionById);

SchoolCategoryRoute.get("/catname/:cat_name",auth, SchoolCategoryController.getSchoolCategoryByName);
//-------------------------- Category Route End -----------------------------------//

module.exports = SchoolCategoryRoute;