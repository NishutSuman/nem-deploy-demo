const mongoose = require("mongoose");
const orderModel = require("../model/order.model.js");
const jwt = require("jsonwebtoken");
const redis = require("../config/redis.config.js");
const cron= require('node-cron')


const placeOrder = async (req, res) => {
	try {
		// const newOrder = new orderModel(req.body);
		// await newOrder.save();
		const token = req.headers["authorization"]?.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		let newOrder = await orderModel.create({
			...req.body,
			orderedBy: req.userId,
		});
        await redis.del(req.user.userId); // Invalidate the cache
		res
			.status(201)
			.json({ message: "Order placed successfully", order: newOrder });
	} catch (error) {
		res.status(500).json({ message: "Error placing order", error });
	}
};

const getAllOrders = async (req, res) => {
	try {
		// Apply caching for this route
		// If data is fetched from first time ---> get it from MongoDB
		// if data is fetched from second time ---> get it from Redis
		let cachedOrders = await redis.get(req.user.userId);
		console.log(cachedOrders);
		if (cachedOrders) {
			console.log("Fetched from Redis");
			return res
				.status(200)
				.json({
					message: "Orders fetched from Redis",
					orders: JSON.parse(cachedOrders),
				});
		}else{
            console.log("Fetched from MongoDB");
            const orders = await orderModel.find().populate("orderedBy");
			            redis.set(req.user.userId, JSON.stringify(orders));

            res.status(200).json({ message: "Orders fetched from MongoDB", orders });
        }
	} catch (error) {
		res.status(500).json({ message: "Error fetching orders", error });
	}
};

const updateOrderById = async (req, res) => {
	try {
		const { orderId } = req.params;
		const updatedOrder = await orderModel.findByIdAndUpdate(orderId, req.body, {
			new: true,
		});
		res
			.status(200)
			.json({ message: "Order updated successfully", order: updatedOrder });
	} catch (error) {
		res.status(500).json({ message: "Error updating order", error });
	}
};

// Get Orders by User ID
const getOrdersByUserId = async (req, res) => {
	try {
		const { userId } = req.params;
		const orders = await orderModel
			.find({ orderedBy: userId })
			.populate("orderedBy");
		res.status(200).json({ message: "Orders fetched successfully", orders });
	} catch (error) {
		res.status(500).json({ message: "Error fetching orders", error });
	}
};

// Delete order by Order ID
const deleteOneOrder = async (req, res) => {
	try {
		const { orderId } = req.params;
		await orderModel.findByIdAndDelete(orderId);
		res.status(200).json({ message: "Order deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting order", error });
	}
};

// create bulk order with cron every 2 mins
const bulkOrderCreation = async (req, res) => {
	// take the bulk orders and set it in redis
	// req.body is array of orders
	// Use the cron job here
	bulkCron.start();
	await redis.set("bulkOrders", JSON.stringify(req.body));
	res.status(201).json({ message: "Orders are in queue and will be placed soon..Don't worry" });
}

const bulkCron= cron.schedule(' */1 * * * *', async () => {
	console.log("Cron job started");
	const bulkOrdersToBeAdded = await redis.get("bulkOrders");
	if (bulkOrdersToBeAdded) {
		const orders = JSON.parse(bulkOrdersToBeAdded);
		await orderModel.insertMany(orders);
		await redis.del("bulkOrders"); // Invalidate the cache
		console.log("Bulk Orders added to DB, cron ended");
		// Clear the bulk orders from Redis
		await redis.del("bulkOrders");
	}else{
		console.log("No bulk orders to be added at this time");
	}
});

module.exports = {
	placeOrder,
	getAllOrders,
	updateOrderById,
	getOrdersByUserId,
	deleteOneOrder,
	bulkOrderCreation
};
