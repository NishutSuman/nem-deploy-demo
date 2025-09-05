const userModel = require("../model/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlackListModel = require("../model/blackListedToken.model.js");
require("dotenv").config();
const nodemailer = require("nodemailer");

const userRegistration = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		// Check if user already exists
		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				message:
					"User Already exists...try with different email or Login with same Email",
			});
		}

		//hash the password before saving
		const hashedPassword = await bcrypt.hash(password, 10);
		console.log(hashedPassword);
		const newUser = new userModel({
			name,
			email,
			password: hashedPassword,
			role,
		});
		await newUser.save();
		res
			.status(201)
			.json({ message: "User registered successfully", user: newUser });
	} catch (error) {
		res.status(500).json({ message: "Error registering user", error });
	}
};

// User Login
const logIn = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await userModel.findOne({ email });
		// console.log(user);
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		} else {
			//Generate a web token
			const token = jwt.sign(
				{ userId: user._id, role: user.role }, //---> Payload which contains user ID and role
				process.env.JWT_SECRET
			);
			res
				.status(200)
				.json({ message: "Login successful", userdata: user, token });
		}
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error });
	}
};

// User Logout
const logout = async (req, res) => {
	let token = req.headers["authorization"]?.split(" ")[1];
	await BlackListModel.create({ token });
	res.status(200).json({ message: "Logout Successful" });
};

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.EMAILID_FOR_NODE_MAILER,
		pass: process.env.PASSWORD_FOR_NODE_MAILER,
	},
});

const sendMail = async (req, res) => {
	const info = await transporter.sendMail({
		from: '"Nishut Suman" <nishutsuman1998@gmail.com>',
		to: "daviddas1998@gmail.com, shubhamkyp300@gmail.com, vbattise75@gmail.com", // user.email
		subject: "Node Mailer Check Mail✔", // password reset
		text: "Checking the Nodem Mailer functionality through text", // plain‑text body --> Anyone of text or html
		// html: "<b>Checking the Nodem Mailer functionality</b>", // HTML body

		// Wrap in an async IIFE so we can use await.
	});
	res.status(200).json({ message: "Mail Sent", info });

	console.log("Message sent:", info.messageId);
};

const forgetPassword = async (req, res) => {
	// Implementation for forget password
	const { email } = req.body;
	let user = await userModel.findOne({ email });

	if (!user) {
		return res.status(404).json({ message: "User not found" });
	} else {
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: 300,
		});
		let resetLink = `http://127.0.0.1:5500/S11/frontend/resetPassword.html?token=${token}`;

		const info = await transporter.sendMail({
			from: '"Nishut Suman" <nishutsuman1998@gmail.com>',
			to: user.email,
			subject: "Password Reset",
			html: `<b>Hello user, Please find the reset password link,click to reset </b>
    <p>Rest Password Link: ${resetLink}</p>
    <h5>Please Note, Link Expires In 5 Mins</h5>`, // HTML body
		});
		res.status(200).json({
			message: "Password reset link has been sent to your email",
			resetLink,
		});
	}

	// Generate a reset token and send it via email
};

const resetPassword = async (req, res) => {
	const { token } = req.query;
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	if (decoded) {
		let user = await userModel.findById(decoded.userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		user.password = req.body.password;
		await user.save();

		// Now black list the token
		let token = req.headers["authorization"]?.split(" ")[1];
		await BlackListModel.create({ token });
		return res.status(200).json({ message: "Password reset successful" });
	}

	else {
		return res.status(400).json({ message: "Invalid or expired token" });
	}
	// res.status(200).json({ message: "Reset Password Endpoint" });
};

module.exports = {
	userRegistration,
	logIn,
	logout,
	sendMail,
	forgetPassword,
	resetPassword,
};
