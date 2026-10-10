import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


const getRegisterPage = (req, res) => {
    res.render("register", {
            title: "Register",
        });
};
 const getLoginPage = (req, res) => {
    res.render("login", {
        error: null
    });
};


 const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    res.render("dashboard", {
      title: "Dashboard - DevHub",
      user,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).send("Something went wrong");
  }
};


const registerUser = async (req, res) => {
    const { username, email, password } = req.body ?? {};

    try {
        if(typeof username !== "string" || typeof email !== "string" || typeof password !== "string" || !username.trim() || !email.trim() || password.length < 6 || password.length > 128 || username.length > 30 || email.length > 254){
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
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });
        res.status(201).json({
            message: "User registered successfully.",
            ...(process.env.NODE_ENV === "production" ? {} : { token }),
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


const loginUser = async(req,res) => {
    const {email, password} = req.body ?? {};

    try{
        if(typeof email !== "string" || typeof password !== "string" || !email.trim() || !password || password.length > 128){
            return res
                .status(400)
                .json({message: "Email and password are required."});
        }

        // check if the user exists
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res
                .status(400)
                .json({message: "Invalid email or password."});
        }

        // compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res
                .status(400)
                .json({message: "Invalid email or password."});
        }

        // generate a JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login successful.",
            ...(process.env.NODE_ENV === "production" ? {} : { token }),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        }); 

    } catch (error) {
        console.error("Error during user login:", error);
        res
            .status(500)
            .json({message: "Server error during login."});
    }
}

const logoutUser = (req, res) => {
    // Clear the JWT token from the client (if stored in cookies)
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful." });
};

const getForgetPasswordPage = (req, res) => {
    res.render("forgot-password", {
        title: "Forgot Password",
    });
};

const hashResetToken = (token) =>
    createHash("sha256").update(token).digest("hex");

const isResetToken = (token) =>
    typeof token === "string" && /^[a-f0-9]{64}$/.test(token);

const sendPasswordMessage = (req, res, status, view, message, locals = {}) => {
    if (req.is("application/x-www-form-urlencoded")) {
        return res.status(status).render(view, {
            error: status >= 400 ? message : null,
            message: status < 400 ? message : null,
            ...locals,
        });
    }

    return res.status(status).json({ message });
};

const getResetPasswordPage = async (req, res) => {
    const { token } = req.params;

    try {
        const user = isResetToken(token)
            ? await User.findOne({
                resetPasswordToken: hashResetToken(token),
                resetPasswordExpires: { $gt: new Date() },
            })
            : null;

        return res.status(user ? 200 : 400).render("reset-password", {
            title: "Reset Password",
            token: user ? token : null,
            error: user ? null : "This password reset link is invalid or has expired.",
        });
    } catch (error) {
        console.error("Error loading reset password page:", error);
        return res.status(500).render("reset-password", {
            title: "Reset Password",
            token: null,
            error: "Unable to load the password reset page. Please try again.",
        });
    }
};

const forgetPassword = async (req, res) => {
    const { email } = req.body ?? {};

    try {
        if (typeof email !== "string" || !email.trim()) {
            return sendPasswordMessage(
                req, res, 400, "forgot-password", "Email is required."
            );
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return sendPasswordMessage(
                req, res, 200, "forgot-password", "If an account exists for that email, password reset instructions will be available shortly."
            );
        }

        const resetToken = randomBytes(32).toString("hex");
        // Store only a hash; the original token is used in the reset link.
        user.resetPasswordToken = hashResetToken(resetToken);
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const isDevelopment = process.env.NODE_ENV !== "production";
        const appUrl = (process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`)
            .replace(/\/+$/, "");
        const resetUrl = `${appUrl}/reset-password/${resetToken}`;

        // Development delivery only; production email delivery is not configured.
        if (isDevelopment) {
            console.log(`Password Reset Link: ${resetUrl}`);
        }

        const message = isDevelopment
            ? "Password reset link generated. Check the server terminal."
            : "Password reset requested.";

        if (req.is("application/x-www-form-urlencoded")) {
            return sendPasswordMessage(req, res, 200, "forgot-password", message);
        }

        return res.status(200).json({
            message,
            ...(isDevelopment ? { resetToken, resetUrl } : {}),
        });
    } catch (error) {
        console.error("Error during forget password:", error);
        return sendPasswordMessage(
            req, res, 500, "forgot-password", "Server error during forget password."
        );
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body ?? {};
    const invalidLinkMessage = "This password reset link is invalid or has expired.";

    try {
        if (!isResetToken(token)) {
            return sendPasswordMessage(
                req, res, 400, "reset-password", invalidLinkMessage, { token: null }
            );
        }

        const tokenOwner = await User.findOne({
            resetPasswordToken: hashResetToken(token),
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!tokenOwner) {
            return sendPasswordMessage(
                req, res, 400, "reset-password", invalidLinkMessage, { token: null }
            );
        }

        if (typeof password !== "string" || typeof confirmPassword !== "string" ||
            !password || !confirmPassword) {
            return sendPasswordMessage(
                req, res, 400, "reset-password", "Password and confirmation are required.", { token }
            );
        }

        if (password.length < 6) {
            return sendPasswordMessage(
                req, res, 400, "reset-password", "Password must be at least 6 characters.", { token }
            );
        }

        if (password !== confirmPassword) {
            return sendPasswordMessage(
                req, res, 400, "reset-password", "Passwords do not match.", { token }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Consume the unexpired token and update the password in one operation.
        const user = await User.findOneAndUpdate(
            {
                resetPasswordToken: hashResetToken(token),
                resetPasswordExpires: { $gt: new Date() },
            },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return sendPasswordMessage(
                req, res, 400, "reset-password", invalidLinkMessage, { token: null }
            );
        }

        if (req.is("application/x-www-form-urlencoded")) {
            return res.redirect(303, "/login");
        }

        return res.status(200).json({ message: "Password reset successfully. Please log in." });
    } catch (error) {
        console.error("Error during reset password:", error);
        return sendPasswordMessage(
            req, res, 500, "reset-password", "Server error during password reset.", { token }
        );
    }
};

export { 
    getRegisterPage, 
    registerUser, 
    getDashboard,
    getLoginPage,
    loginUser,
    logoutUser,
    getForgetPasswordPage,
    getResetPasswordPage,
    forgetPassword,
    resetPassword
};
