const jwt = require('jsonwebtoken')
const roleBasedAccessControl = (role) => {
	return (req, res, next) => {
        const token = req.headers["authorization"]?.split(" ")[1]; 
		console.log("From Check Role Middleware");
		console.log(role);
        console.log(req.role);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Role:", decoded.role);
		if ("admin"===decoded.role) {
            console.log("inside if block")
			next();
		} else {
			return res.status(403).json({ message: "Access denied" });
		}
	};
};
module.exports = roleBasedAccessControl;
