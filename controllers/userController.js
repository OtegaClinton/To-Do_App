const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const sendMail = require('../helpers/email');
const html = require('../helpers/html');
const forgotPasswordhtml= require("../helpers/forgotPasswordHTML");

// exports.signUpUser = async (req, res) => {
//     try {
//         const { fullName, email, password } = req.body;
//         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         // Validating inputs
//         if (!fullName || fullName.trim().length === 0) {
//             return res.status(400).json({ message: "Full name field cannot be empty" });
//         }

//         if (!email || !emailPattern.test(email)) {
//             return res.status(400).json({ message: "Invalid email" });
//         }

//         const existingEmail = await userModel.findOne({ email });
//         if (existingEmail) {
//             return res.status(400).json({ message: "User with this email already exists" });
//         }

//         // Using bcrypt to salt and hash the password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const user = new userModel({
//             fullName,
//             email: email.toLowerCase(),
//             password: hashedPassword,
//         });

//         const createdUser = await user.save();

//         // Using JWT to sign the user in
//         const userToken = jwt.sign({ id: createdUser._id, email: createdUser.email }, process.env.JWT_SECRET, { expiresIn: "3 minutes" });

//         const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${createdUser._id}/${userToken}`;

//         sendMail({
//             subject: "Kindly verify your email.",
//             email: createdUser.email,
//             html: html(verifyLink, createdUser.fullName)
//         });

//         res.status(201).json({
//             message: `Welcome ${createdUser.fullName}, kindly check your email to access the link to verify your email.`,
//             data: createdUser
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: error.message
//         });
//     }
// };




exports.signUpUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const emailPattern = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mil|co\.[a-zA-Z]{2,}|[a-zA-Z]{2,})$/;
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

        // Validating inputs
        if (!fullName || fullName.trim().length === 0) {
            return res.status(400).json({ message: "Full name field cannot be empty" });
        }

        if (!email || !emailPattern.test(email)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        if (!password || !passwordPattern.test(password)) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character" 
            });
        }

        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Using bcrypt to salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new userModel({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        const createdUser = await user.save();

        // Using JWT to sign the user in
        const userToken = jwt.sign({ id: createdUser._id, email: createdUser.email }, process.env.JWT_SECRET, { expiresIn: "3 minutes" });

        const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${createdUser._id}/${userToken}`;

        sendMail({
            subject: "Kindly verify your email.",
            email: createdUser.email,
            html: html(verifyLink, createdUser.fullName)
        });

        res.status(201).json({
            message: `Welcome ${createdUser.fullName}, kindly check your email to access the link to verify your email.`,
            data: createdUser
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



exports.verifyEmail = async (req, res) => {
    try {
        const { id, token } = req.params;
        const findUser = await userModel.findById(id);

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (error) => {
            if (error) {
                const link = `${req.protocol}://${req.get("host")}/api/v1/newemail/${findUser._id}`;
               
                await sendMail({
                    subject: 'Kindly verify your email',
                    email: findUser.email,
                    html: html(link, findUser.fullName)
                });
                return res.status(400).json({ message: 'This link has expired, kindly check your email for a new link' });
            } else {
                if (findUser.isVerified) {
                    return res.status(400).json({ message: 'Your account has already been verified' });
                }
                await userModel.findByIdAndUpdate(id, { isVerified: true });
                return res.send('Account verified successfully.');
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



exports.newEmail = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "3 minutes" });

        const reverifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${user._id}/${userToken}`;

        sendMail({
            subject: "Kindly verify your email",
            email: user.email,
            html: html(reverifyLink, user.fullName)
        });

        res.status(200).json({
            message: "Verification email sent"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};




exports.logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                message: `User with email ${email} does not exist.`
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: `Incorrect password.`
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10 minutes" });

        const { createdAt, updatedAt, __v,isVerified,isAdmin,todo, ...otherDetails } = user._doc;

        res.status(200).json({
            message: `Login successful.`,
            data: otherDetails,
            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.makeAdmin= async(req,res)=>{
    try {
        const newAdmin = await userModel.findByIdAndUpdate(req.params.id,{isAdmin:true});

        res.status(200).json({
            message:`${newAdmin.fullName} is now an ADMIN.`
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message 
        })
        
    }
};


exports.getAllUsers = async(req,res)=>{
    try {
        const allUsers = (await userModel.find().populate('todo').exec()).sort({createdAt:-1});
       
        res.status(200).json({
            message:`list of all users:`,
            data: allUsers
        })


        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}



exports.deleteUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: `User with ID: ${req.params.id} not found.`
            });
        }

         await userModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: `User with ID: ${req.params.id} has been deleted successfully.`
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};





exports.changePassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({ message: 'Invalid old password' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New password and confirm new password do not match' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ 
            message: 'Password changed successfully' 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: error.message
         });
    }
};




exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const fullName = user.fullName;

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const verificationLink = `${req.protocol}://${req.get("host")}/api/v1/resetpassword/${user._id}/${token}`;
        const htmlContent = forgotPasswordhtml (fullName, verificationLink);
        const emailSubject = 'Reset Password';

        const mailOptions = {
            from: process.env.mailUser,
            to: user.email,
            subject: emailSubject,
            html: htmlContent
        };

        await sendMail(mailOptions);
        

        res.status(200).json({ message: 'Email sent successfully', token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserWithTodos = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).populate('todo').exec();

        res.status(200).json({
            message: "User and their todos retrieved successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.logOut = (req, res) => {
    try {
        res.cookie('token', '', { expires: new Date(0), httpOnly: true });
        res.status(200).json({
            message: 'Logout successful',
            redirectURL: 'http://localhost:5050/login'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};





