import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async(req,res,next)=>{
    const isApiRequest = req.originalUrl.startsWith("/api/");
    const rejectAuthentication = () => {
        res.clearCookie("token");
        if (isApiRequest) {
            return res.status(401).json({
                success: false,
                message: "A valid authentication token is required.",
            });
        }
        return res.redirect("/login");
    };

    try{
        const authorization = req.header("Authorization");
        const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
        const token = req.cookies?.token || bearerToken;


        if(!token){
            return rejectAuthentication();
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        if (!decoded || typeof decoded.userId !== "string" || !/^[a-f\d]{24}$/i.test(decoded.userId)) return rejectAuthentication();

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return rejectAuthentication();
        }

        if(!user.isActive){
            return rejectAuthentication();
        }

        req.user = user;
        next();
        
    } catch(error){
        if (error instanceof jwt.JsonWebTokenError) {
            return rejectAuthentication();
        }

        console.error(error);
        if (isApiRequest) {
            return res.status(500).json({
                success: false,
                message: "Authentication could not be completed.",
            });
        }
        return res.status(500).send("Authentication could not be completed.");
    }
}

export {authMiddleware};
