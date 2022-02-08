const PaymentRoute = require("express").Router();
const PaymentController = require("../../controllers/user/Payment.controller");
const auth = require("../../Middlewares/userauth");

//-------------------------- Payment Route End -----------------------------------//

//  1. Results Summary
PaymentRoute.post("/order", auth, PaymentController.getOrder);


PaymentRoute.post("/capture", auth, PaymentController.getPayment);


PaymentRoute.post("/suborder", auth, PaymentController.getSubOrder);

PaymentRoute.get("/promocode/:code", auth, PaymentController.getPromoCode);

PaymentRoute.post("/cartorder", auth, PaymentController.getCartOrder);

PaymentRoute.get("/usedpromocodecount/:code", auth, PaymentController.getUsedPromoCodeCount);


//-------------------------- Payment Route End -----------------------------------//

module.exports = PaymentRoute;
