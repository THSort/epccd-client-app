import mongoose, {Schema, Document} from "mongoose";

export interface IDemographicSurvey extends Document {
    id_user: string;  // Foreign key to User
    age?: number;
    asthma?: boolean;
    language_preference?: string; // User's preferred language
    // More optional fields can be added later
}

const DemographicSurveySchema = new Schema<IDemographicSurvey>({
    id_user: {type: String, required: true, ref: "User"},  // Reference to users collection
    age: {type: Number, required: false},
    asthma: {type: Boolean, required: false},
    language_preference: {type: String, required: false},
    // More fields can be added later
}, {timestamps: true});

export default mongoose.model<IDemographicSurvey>("DemographicSurvey", DemographicSurveySchema, 'demographic_survey');
