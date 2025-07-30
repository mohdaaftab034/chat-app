import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utills.js";
import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs'


export const signup = async (req, res)=> {
    const { fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details"});
        }
        const user = await userModel.findOne({email});

        if(user){
            return res.json({success: false, message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await userModel.create({
            fullName, email, password: hashedPassword, bio
        })

        const token = generateToken(newUser._id);
        res.json({success: true, userData: newUser, token, message: "account created"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const login = async (req, res)=> {
    try {
        const {email, password} = req.body;
        const userData = await userModel.findOne({email});

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
         if(!isPasswordCorrect){
             return res.json({success: false, message: "Invalid Password"});
         }

         const token = generateToken(userData._id);
        res.json({success: true, userData, token, message: "login successfull"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const checkAuth = (req, res)=> {
    res.json({success: true, user: req.user});
}

export const updateProfile = async (req, res)=> {
    try {
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            await userModel.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        } else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await userModel.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }

        res.json({success: true, user: updatedUser});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}