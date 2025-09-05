const express = require("express");
const connectDB = require("./src/config/db.js");
const cors= require("cors");
const app = express();
app.use(express.json());
app.use(cors());


// redis.set("mykey", "Hello Redis");

// redis.get("mykey", (err, result) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(result); // Prints "value"
//   }
// });

const userRoute = require("./src/routes/user.route.js");
const orderRoute = require("./src/routes/order.route.js");

app.use("/user", userRoute);
app.use("/order", orderRoute);

app.get("/", async (req, res) => {
	res.send("Welcome to Home Page");
});

app.listen(3000, () => {
	connectDB();
	console.log("Server is running on port 3000");
});
