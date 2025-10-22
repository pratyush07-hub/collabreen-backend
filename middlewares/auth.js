const jwt = require("jsonwebtoken");
require('dotenv').config();

async function checkAuth(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ msg: "Please login" });
    }

    const token = authHeader.split(" ")[1];


    console.log("Token:", token);
    if (!token) {
        return res.status(401).json({ msg: "Token missing" });
    }

    try {
        const user =  jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded User:", user);
        req.user = user.userDetails; 
        next();
    } catch (err) {
        console.error(err)
        return res.status(403).json({ msg: "Invalid or expired token", token });
    }
}

async function checkBrand(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ msg: "User not authenticated" });
    }
    if (req.user.role === 'brand') {
        return next();
    } else if (req.user.role === 'user') {
        return res.status(400).json({ msg: "Please register as a brand" });
    } else {
        return res.status(403).json({ msg: "Restricted access, brand only" });
    }
}

async function checkInfluencer(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ msg: "User not authenticated" });
    }
    if (req.user.role === 'influencer') {
        return next();
    } else if (req.user.role === 'user') {
        return res.status(400).json({ msg: "Please register as an influencer" });
    } else {
        return res.status(403).json({ msg: "Restricted access, influencer only" });
    }
}

module.exports = { checkAuth, checkBrand, checkInfluencer };

