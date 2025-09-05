const userRoute = require("express").Router();
const {
	userRegistration,
	logIn,
	logout,
	sendMail,
	forgetPassword,
	resetPassword,
} = require("../controllers/user.controller");

userRoute.post("/register", userRegistration);
userRoute.post("/login", logIn);
userRoute.post("/logout", logout);
userRoute.get("/sendmail", sendMail);
userRoute.post("/forget-password", forgetPassword);
userRoute.patch("/reset-password", resetPassword);

module.exports = userRoute;
