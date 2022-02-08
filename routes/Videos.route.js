const VideosRoute = require("express").Router();
const VideosController = require("../controllers/Videos.controller");
const auth = require("../Middlewares/auth");
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
    storage: storage,
});

VideosRoute.get("/", VideosController.get);
VideosRoute.post("/", upload.single("videos"), auth, VideosController.create);
VideosRoute.put("/:videosId", upload.single("videos"), auth, VideosController.update);
VideosRoute.delete("/", auth, VideosController.delete);

module.exports = VideosRoute;