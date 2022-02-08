const LoginRoute = require("express").Router();
const LoginController = require("../../controllers/user/Login.controller");
const auth = require("../../Middlewares/userauth");

//-------------------------- User Route Start -----------------------------------//

// 1. Login Route
LoginRoute.post("/", LoginController.validateLogin);

// 2. Signup User
LoginRoute.post("/sign-up", LoginController.signupStudent);

// 3. Verify OTP User
LoginRoute.post("/verify-otp", LoginController.verifyOtpStudent);

// 4. Resend OTP User
LoginRoute.post("/resend-otp", LoginController.resendOtpStudent);

// 5. Check Value avail or not
LoginRoute.post("/check-value", LoginController.checkValueStudent);

// 6. Forgot Password
LoginRoute.post("/forgot-password", LoginController.forgotPasswordStudent);

// 7. Get Single Profile
LoginRoute.get("/get-profile/:stud_id", auth, LoginController.getProfile);

// 8. Update Profile
LoginRoute.put("/update/profile/:stud_id", auth, LoginController.updateProfile);

// 9. Update Profile for Mobile
LoginRoute.put("/update/profile-mobile/:stud_id", auth, LoginController.updateProfileMobile);

// 10. Refresh Token
LoginRoute.post("/refresh-token", LoginController.getRefreshToken);

LoginRoute.post("/logout", auth, LoginController.userLogout);

LoginRoute.get("/logoutalldevices/:userid", LoginController.logoutAllUser);

//-------------------------- User Route Start -----------------------------------//

module.exports = LoginRoute;
