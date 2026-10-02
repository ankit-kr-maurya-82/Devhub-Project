import User from "../models/user.model.js";

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(
            req.params.userId
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const updateProfile = async(req,res)=> {
    try{
        const {name, username, bio, avatar, skills} = req.body;

        const user = await User.findById(req.user._id);
        
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"   
            });
        }

        user.name = name || user.name;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.avatar = avatar || user.avatar;
        user.skills = skills || user.skills;
        
        await user.save();
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export {
    getProfile,
    updateProfile
};