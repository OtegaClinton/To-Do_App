require("dotenv").config();
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

exports.authorization = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json("Token not provided.");
        }

        jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
            if (error) {
                return res.status(401).json("Invalid token, please log in again.");
            }

            req.user = decoded.id;
            const checkUser = await userModel.findById(req.user);

            if (!checkUser) {
                return res.status(404).json("User not found.");
            }

            if (!checkUser.isAdmin && !checkUser.isSuperAdmin) {
                return res.status(403).json("You are not authorized to perform this action.");
            }

            next();
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
