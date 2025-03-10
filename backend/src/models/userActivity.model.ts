import mongoose, { Schema, Document } from "mongoose";

export interface IUserActivity extends Document {
  user_id: string;
  timestamp: Date;
  action_type: string;
  action_details: {
    [key: string]: any;
  };
  device_info?: {
    platform?: string;
    os_version?: string;
    app_version?: string;
  };
}

const UserActivitySchema = new Schema<IUserActivity>({
  user_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  action_type: { type: String, required: true },
  action_details: { type: Schema.Types.Mixed, required: true },
  device_info: {
    platform: { type: String },
    os_version: { type: String },
    app_version: { type: String }
  }
}, { timestamps: true });

// Create index on user_id and timestamp for faster queries
UserActivitySchema.index({ user_id: 1, timestamp: -1 });

export default mongoose.model<IUserActivity>("user_activity", UserActivitySchema, 'user_activity');