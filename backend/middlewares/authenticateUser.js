import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticateToken = async (req, res, next) => {
    try{
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorised user!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Unauthorised user!" });
        }

        req.user = user;
        next();
    } catch(error) {
        console.error(`Error in authentiateToken: ${error.message}`);
        return res.status(500).json({ message: error.message });
    }
} 

export default authenticateToken;