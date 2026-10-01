import User from "../models/user.model.js";

const getProfile = async (req, res) => {
    try {
        const user_id = req.user._id;

        const user = await User.findById(user_id).select("-password");
        if (!user) {
            return res
                .status(404)
                .json(
                    {
                        success: false,
                        message: "User not found"
                    }
                )
        }

        // return res.render("profile", {
        //     user:user,
        // })

        return res.status(200).json({
            success: true,
            data: user
        });



            
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({
                    success: false,
                    message: "Internal server error"
                })
    } 
};

export {
    getProfile
}
