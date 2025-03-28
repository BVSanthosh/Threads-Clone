import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticateToken = async (req, res, next) => {
    try{
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ message: "Unauthorised user!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            res.status(401).json({ message: "Unauthorised user!" });
        }

        req.user = user;
        next();
    } catch(error) {
        res.status(500).json({ message: error.message });
        console.error(`Error in authentiateToken: ${error.message}`);
    }
} 

export default authenticateToken;