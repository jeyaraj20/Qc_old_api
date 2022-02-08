const LocationRoute = require("express").Router();
const LocationController = require("../controllers/Location.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Location Route Start ------------------------------//

// 1. Get All  Country By status
LocationRoute.get("/country/:status", auth, LocationController.getAllCountry);

// 2. Get All State By status
LocationRoute.get("/state/:status", auth, LocationController.getAllState);

// 3. Get All City By status
LocationRoute.get("/city/:status", auth, LocationController.getAllCity);

// 4. Create State
LocationRoute.post("/state", auth, LocationController.createState);

// 5. Update State By id
LocationRoute.put("/state/:stateId", auth, LocationController.updateState);

// 6. Update State Status
LocationRoute.put("/statestatus", auth, LocationController.updateStateStatus);

// 7. Crete City
LocationRoute.post("/city", auth, LocationController.createCity);

// 8. Update City
LocationRoute.put("/city/:cityId", auth, LocationController.updateCity);

// 9. Update City Status
LocationRoute.put("/citystatus", auth, LocationController.updateCityStatus);

LocationRoute.get("/statename/:statename", auth, LocationController.getStateByName);

LocationRoute.get("/cityname/:cityname", auth, LocationController.getCityByName);

// 12. Get State Count Only
LocationRoute.get("/state/count/:state_status", auth, LocationController.getStateCount);

// 13. Get City Count Only
LocationRoute.get("/city/count/:city_status", auth, LocationController.getCityCount);

//-------------------------- Location Route End ------------------------------//

module.exports = LocationRoute;
