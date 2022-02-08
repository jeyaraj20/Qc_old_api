const CouponRoute = require("express").Router();
const CouponController = require("../controllers/Coupon.controller");
const auth = require("../Middlewares/auth");
//-------------------------- Exam Package Route Start ------------------------------//

// 1. Get All Exam Package
CouponRoute.get("/status/:status", CouponController.getAllCoupons);

CouponRoute.post("/", auth, CouponController.createCoupon);

CouponRoute.put("/id/:coupon_id", auth, CouponController.updateCoupon);

CouponRoute.put("/status",auth, CouponController.updateStatusById);

CouponRoute.get("/duration", CouponController.getAllDurations);

//-------------------------- Exam Package Route End -----------------------------------//

module.exports = CouponRoute;
