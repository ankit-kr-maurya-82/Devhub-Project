import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


const getRegisterPage = (req, res) => {
    res.render("register", {
            title: "Register",
        });
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if(!username || !email || !password){
            return res
                .status(400)
                .json({ message: "Username, email, and password are required." });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res
                .status(400)
                .json({ message: "User with this email already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign(
            {
                userId: newUser._id,
                username: newUser.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(201).json({
            message: "User registered successfully.",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },

        })





    } catch (error) {
        console.error("Error during user registration:", error);
        res
            .status(500)
            .json({ message: "Server error during registration." });
    }
}


export { getRegisterPage, registerUser };