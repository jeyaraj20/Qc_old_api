const express = require("express");
const DashboardCategoryRoute = express.Router();
const DashboardCategoryController = require("../controllers/DashboardCategory.controller");
const path = require("path");
var fs = require("fs");
const multer = require("multer");
const auth = require("../Middlewares/auth");
require("dotenv").config();

//-------------------------- Multer Part Start ----------------------------------//

// Ensure HomeCategory Directory directory exists
var homeCategoryDir = path.join(process.env.homeCategory);
fs.existsSync(homeCategoryDir) || fs.mkdirSync(homeCategoryDir);

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, process.env.homeCategory);
    },
    filename: (req, file, callBack) => {
        callBack(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10000000, files: 1 },
});

//-------------------------- Multer Part End ---------------------------------------//

//-------------------------- Home Category Route Start ------------------------------//

// 1. Get All Active Home Category
DashboardCategoryRoute.get("/", DashboardCategoryController.getAllActiveDashboardCategory);

// 2. Get All InActive Home Category
DashboardCategoryRoute.get( "/inactive", DashboardCategoryController.getAllInactiveDashboardCategory);

// 3. Get Home Category By Position No
DashboardCategoryRoute.get("/position/:position",DashboardCategoryController.getDashboardCategoryByPosition
);

// 4. Create Home Category
DashboardCategoryRoute.post(
    "/",
    upload.single("exa_cat_image_url"),
    DashboardCategoryController.createDashboardCategory
);

// 5. Update Home Category
DashboardCategoryRoute.put(
    "/catId/:catId",
  //  upload.single("exa_cat_image_url"),
    DashboardCategoryController.updateDashboardCategoryById
);

// 6. Update 'Inactive'
DashboardCategoryRoute.put("/inactive", DashboardCategoryController.updateInactiveById);

// 7. Update 'Delete'
DashboardCategoryRoute.delete("/", DashboardCategoryController.updateDeleteById);

// 8. Update 'Position'
DashboardCategoryRoute.put("/position", DashboardCategoryController.updatePositionById);

// 9. Get Home Category By Id
DashboardCategoryRoute.get("/:catId", DashboardCategoryController.getDashboardCategoryById);

// 10. Get Home Category By name
DashboardCategoryRoute.get(
    "/categoryName/:catName",
    DashboardCategoryController.getDashboardCategoryBycategoryName
);

// 11. Search Home Category
DashboardCategoryRoute.post("/search", DashboardCategoryController.getSearchResult);

// 12. Get Count Only
DashboardCategoryRoute.get("/count/status/:status",auth, DashboardCategoryController.getCountOnly);

//-------------------------- Home Category Route End -----------------------------------//

module.exports = DashboardCategoryRoute;
