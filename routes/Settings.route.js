const SettingsRoute = require("express").Router();
const SettingsController = require("../controllers/Settings.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Settings Route Start -----------------------------------//

// 1. Get Settings
SettingsRoute.get("/",auth, SettingsController.getSettings);

// 3. Update Settings
SettingsRoute.put("/",auth, SettingsController.updateSettings);

//-------------------------- Settings Route End -----------------------------------//

module.exports = SettingsRoute;
