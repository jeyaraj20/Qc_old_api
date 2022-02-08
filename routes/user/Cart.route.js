const CartRoute = require("express").Router();
const CartController = require("../../controllers/user/Cart.controller");
const auth = require("../../Middlewares/userauth");

CartRoute.get("/allcartitems", auth, CartController.getAllCartItems);

CartRoute.post("/additem", auth, CartController.addItemToCart);

CartRoute.post("/removeitem", auth, CartController.removeItemFromCart);

CartRoute.post("/getexistingcartitems", auth, CartController.getExistingCartItems);

//CartRoute.get("/master", auth, AllexamController.getMaster);

//-------------------------- Exam Main Category Route End -----------------------------------//

module.exports = CartRoute;
