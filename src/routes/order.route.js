const orderRoute = require("express").Router();
const {
	placeOrder,
	getAllOrders,
	updateOrderById,
	getOrdersByUserId,
	deleteOneOrder,
	bulkOrderCreation,
} = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware.js");
const roleBasedAccessControl = require("../middlewares/checkRole.middleware.js");

orderRoute.post(
	"/place",
	authMiddleware,
	roleBasedAccessControl("user", "admin"),
	placeOrder
); // Any User Access Required
orderRoute.get("/all", authMiddleware, getAllOrders); // User Access Required
orderRoute.put("/update/:orderId", updateOrderById); // User Access Required
orderRoute.get("/user/:userId", getOrdersByUserId); // User Access Required
orderRoute.delete(
	"/delete/:orderId",
	authMiddleware,
	roleBasedAccessControl("admin"),
	deleteOneOrder
); // Admin Access Required
orderRoute.post(
	"/bulk-order",
	authMiddleware,
	roleBasedAccessControl("admin"),
	bulkOrderCreation
); // Admin Access Required

module.exports = orderRoute;
