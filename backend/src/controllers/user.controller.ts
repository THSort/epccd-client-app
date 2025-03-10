import {Request, Response} from "express";
import User from "../models/user.model";
import {v4 as uuidv4} from "uuid"; // For generating unique user IDs

// Register New User (First Time)
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    console.log('registerUser', req.body);

    try {
        const {fcmToken, location, mobile_number} = req.body;

        if (!fcmToken || !location) {
            res.status(400).json({message: "fcmToken and location are required"});
            return;
        }

        // Generate a new unique user ID
        const id_user = uuidv4();

        // Create and save the user
        const newUser = new User({id_user, fcmToken, location, mobile_number});
        console.log('new user created')
        await newUser.save();

        res.status(201).json({message: "User registered successfully", user: newUser});
    } catch (error) {
        res.status(500).json({message: "Error registering user", error});
    }
};

// Update Existing User
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_user, fcmToken, location} = req.body;

        if (!id_user || (!fcmToken && !location)) {
            res.status(400).json({message: "id_user and at least one field (fcmToken/location) are required"});
            return;
        }

        const updatedUser = await User.findOneAndUpdate(
            {id_user},
            {...(fcmToken && {fcmToken}), ...(location && {location})},
            {new: true}
        );

        if (!updatedUser) {
            res.status(404).json({message: "User not found"});
            return;
        }

        res.json({message: "User updated successfully", user: updatedUser});
    } catch (error) {
        res.status(500).json({message: "Error updating user", error});
    }
};

// Fetch user by id_user
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_user} = req.params;

        const user = await User.findOne({id_user});
        if (!user) {
            res.status(404).json({message: "User not found"});
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({message: "Error fetching user", error});
    }
};

// Fetch user by FCM token
export const getUserByFcmToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const {fcmToken} = req.params;

        const user = await User.findOne({fcmToken});
        if (!user) {
            res.status(404).json({message: "User not found"});
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({message: "Error fetching user", error});
    }
};

// Fetch user by mobile number
export const getUserByMobileNumber = async (req: Request, res: Response): Promise<void> => {
    try {
        const {mobile_number} = req.params;

        const user = await User.findOne({mobile_number});
        if (!user) {
            res.status(404).json({message: "User not found"});
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({message: "Error fetching user", error});
    }
};

// Fetch all users by location
export const getUsersByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const {location} = req.params;

        const users = await User.find({location});
        if (!users.length) {
            res.status(404).json({message: "No users found in this location"});
            return;
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({message: "Error fetching users", error});
    }
};
