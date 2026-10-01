import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async(req,res,next)=>{
    try{
        const token = req.cookies?.token;

        if(!token){
            return res.redirect("/login");
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.redirect("/login");
        }

        if(!user.isActive){
            return res.redirect("/login");
        }

        req.user = user;
        next();
        
    } catch(error){
        console.error(error);
        
        res.clearCookie("token");
        return res.redirect("/login");
    }
}

export {authMiddleware};