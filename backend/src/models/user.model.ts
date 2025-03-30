import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid"; // For generating unique user IDs

export interface IUser extends Document {
    id_user: string;
    fcmToken: string;
    mobile_number?: string;
    location: number; // Location ID (1-21)
    alerts_threshold: string; // Threshold for AQI alerts (one of: 'good', 'satisfactory', 'moderate', 'unhealthyForSensitive', 'unhealthy', 'veryUnhealthy', 'hazardous')
}

const UserSchema = new Schema<IUser>({
    id_user: { type: String, default: uuidv4, unique: true }, // Generate UUID as user ID
    fcmToken: { type: String, required: true, unique: true },
    mobile_number: { type: String, unique: true, sparse: true }, // Unique but can be null
    location: { type: Number, required: true, min: 1, max: 21 },
    alerts_threshold: { type: String, default: 'unhealthy', enum: ['good', 'satisfactory', 'moderate', 'unhealthyForSensitive', 'unhealthy', 'veryUnhealthy', 'hazardous'] },
});

export default mongoose.model<IUser>("User", UserSchema, 'users');
