import express from "express";
import {
    getUserById,
    getUserByFcmToken,
    getUserByMobileNumber,
    getUsersByLocation,
    registerUser,
    updateUser
} from "../controllers/user.controller";

const router = express.Router();

router.post("/register", registerUser);
router.put("/update", updateUser);
router.get("/id/:id_user", getUserById);
router.get("/fcm/:fcmToken", getUserByFcmToken);
router.get("/mobile/:mobile_number", getUserByMobileNumber);
router.get("/location/:location", getUsersByLocation);

export default router;
