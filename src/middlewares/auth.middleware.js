// With help of auth middleware, we can check
// - user authentication
// - authorization for protected routes (Role Based Access Control --> RBAC)
// - token expiration and refresh

const jwt = require("jsonwebtoken");
const BlackListModel = require("../model/blackListedToken.model");

const authMiddleware = async (req, res, next) => {
	console.log("From Auth Middleware");
	try {
		const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from headers --> Bearer <token>  --> [bearer, token]

		let balckListedToken = await BlackListModel.find({ token });
		if (!token) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		// jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		// 	if (err) {
		// 		return res.status(403).json({ message: "Forbidden" });
		// 	}
		// 	req.user = user;
		// 	next();
		// });
		if (token) {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decoded;
			console.log("req.user", req.user);
			console.log("Decoded Token:", decoded);
			next();
		}
	} catch (error) {
		return res.status(500).json({ message: "Internal Server Error" });
	}
};

module.exports = authMiddleware;

// {
//   "email": "user@abc.com",
//   "password": "User@123"

// }
