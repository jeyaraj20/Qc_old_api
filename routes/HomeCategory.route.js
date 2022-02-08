const express = require("express");
const HomeCategoryRoute = express.Router();
const HomeCategoryController = require("../controllers/homecategory.controller");
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
HomeCategoryRoute.get("/",auth, HomeCategoryController.getAllActiveHomeCategory);

// 2. Get All InActive Home Category
HomeCategoryRoute.get(
    "/inactive",auth,
    HomeCategoryController.getAllInactiveHomeCategory
);

// 3. Get Home Category By Position No
HomeCategoryRoute.get(
    "/position/:position",auth,
    HomeCategoryController.getHomeCategoryByPosition
);

// 4. Create Home Category
HomeCategoryRoute.post(
    "/",auth,
    upload.single("exa_cat_image_url"),
    HomeCategoryController.createHomeCategory
);

// 5. Update Home Category
HomeCategoryRoute.put(
    "/catId/:catId",auth,
    upload.single("exa_cat_image_url"),
    HomeCategoryController.updateHomeCategoryById
);

// 6. Update 'Inactive'
HomeCategoryRoute.put("/inactive",auth, HomeCategoryController.updateInactiveById);

// 7. Update 'Delete'
HomeCategoryRoute.delete("/",auth, HomeCategoryController.updateDeleteById);

// 8. Update 'Position'
HomeCategoryRoute.put("/position",auth, HomeCategoryController.updatePositionById);

// 9. Get Home Category By Id
HomeCategoryRoute.get("/:catId",auth, HomeCategoryController.getHomeCategoryById);

// 10. Get Home Category By name
HomeCategoryRoute.get(
    "/categoryName/:catName",auth,
    HomeCategoryController.getHomeCategoryBycategoryName
);

// 11. Search Home Category
HomeCategoryRoute.post("/search",auth, HomeCategoryController.getSearchResult);

// 12. Get Count Only
HomeCategoryRoute.get("/count/status/:status",auth, HomeCategoryController.getCountOnly);

//-------------------------- Home Category Route End -----------------------------------//

module.exports = HomeCategoryRoute;
