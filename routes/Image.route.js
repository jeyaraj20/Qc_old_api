const ImageRoute = require("express").Router();
const ImageController = require("../controllers/Image.controller");

const path = require("path");
const multer = require("multer");


const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, '/tmp');
    },
    filename: (req, file, callBack) => {
        callBack(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage
});


ImageRoute.post("/", upload.single("notes"), ImageController.create);
ImageRoute.delete("/", ImageController.delete);
ImageRoute.post("/thumbnail", upload.single("thumbnail"), ImageController.create);
ImageRoute.post("/attachment", upload.single("attachment"), ImageController.create);

module.exports = ImageRoute;