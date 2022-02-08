const LoginRoute = require("express").Router();
const LoginController = require("../controllers/Login.controller");
LoginRoute.post("/", LoginController.validateLogin);
LoginRoute.post("/adminfaculty", LoginController.validateAdminLogin);
module.exports = LoginRoute;
