const AdminmenuRoute = require("express").Router();
const AdminmenuController = require("../controllers/Adminmenu.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Adminmenu Route Start ------------------------------//

// 1. Get All Active Adminmenu
AdminmenuRoute.get("/",auth, AdminmenuController.getUserMenu);

AdminmenuRoute.get("/all",auth, AdminmenuController.getAllActiveAdminmenu);

AdminmenuRoute.put("/changepasswordsuperadmin",auth, AdminmenuController.updatePasswordSuperAdmin);


AdminmenuRoute.put("/changepasswordadminoperator",auth, AdminmenuController.updatePasswordAdminOperator);

//-------------------------- Adminmenu Route End -----------------------------------//

module.exports = AdminmenuRoute;
