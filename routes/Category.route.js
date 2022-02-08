const CategoryRoute = require("express").Router();
const CategoryController = require("../controllers/Category.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Category Route Start ------------------------------//

// 1. Get All Active Category
CategoryRoute.get("/", auth, CategoryController.getAllActiveCategory);

CategoryRoute.get("/asc", auth, CategoryController.getAllCategoryByAsc);

// 2. Get All Inactive Category
CategoryRoute.get("/inactive/", auth, CategoryController.getAllInactiveCategory);

// 3. Get Category By Id
CategoryRoute.get("/:catId", auth, CategoryController.getCategoryById);

// 4. Get Category By Position No
CategoryRoute.get("/position/:position", auth, CategoryController.getCategoryByPosition);

// 5. Create Category
CategoryRoute.post("/", auth, CategoryController.createCategory);

// 6. Update Category
CategoryRoute.put("/catId/:catId", auth, CategoryController.updateCategoryById);

// 7. Update 'Inactive'
CategoryRoute.put("/inactive", auth, CategoryController.updateInactiveById);

// 8. Update 'Delete'
CategoryRoute.delete("/", auth, CategoryController.updateDeleteById);

// 9. Update 'Position'
CategoryRoute.put("/position", auth, CategoryController.updatePositionById);

CategoryRoute.get("/catname/:cat_name", auth, CategoryController.getCategoryByName);

// 11. Get QBank Main Category Count Only
CategoryRoute.get("/qbank-main/count/:cat_status", auth, CategoryController.getCategoryCount);

//-------------------------- Category Route End -----------------------------------//

module.exports = CategoryRoute;
