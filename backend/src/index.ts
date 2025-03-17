import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import {PORT} from "./config/dotenv";
import {connectDB} from "./config/db";
import exampleRoutes from "./routes/exampleRoutes";
import userRoutes from "./routes/user.routes";
import epaMonitorsDataRoutes from "./routes/epaMonitorsData.routes";
import {
    getPast24HoursEpaMonitorsDataForLocation,
    getPollutantHistoryDataForPast24Hours,
    getPollutantHistoryDataForPastMonth,
    getPollutantHistoryDataForPastThreeMonths,
    getPollutantHistoryDataForPastWeek,
    pollEpaMonitorsData
} from "./services/epaMonitorsData.service";
import demographicSurveyRoutes from "./routes/demographicSurvey.routes";
import userActivityRoutes from "./routes/userActivity.routes";
import {generateHistoricalData} from "./scripts/generateDummyEpaData";

// Load environment variables first
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes); // User-related routes
app.use("/api/epa-monitors", epaMonitorsDataRoutes); // EPA Monitors data routes
app.use("/api/examples", exampleRoutes); // Example routes
app.use("/api/demographics", demographicSurveyRoutes); // Routes for demographic survey info
app.use("/api/user-activity", userActivityRoutes); // User activity tracking routes

const startServer = async () => {
    try {
        await connectDB(); // Ensure DB is connected before starting the server
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


        const currentDateTime = new Date();

        // await getPollutantHistoryDataForPast24Hours(4, currentDateTime);
        // await getPollutantHistoryDataForPastWeek(4, currentDateTime);
        // await getPollutantHistoryDataForPastMonth(4, currentDateTime);
        await getPollutantHistoryDataForPastThreeMonths(4, currentDateTime);

        // // Start polling EPA Monitors Data every 5 minutes
        // const POLLING_INTERVAL_MS = 5 * 60 * 1000;
        // setInterval(() => {
        //     console.log("📡 Polling EPA Monitors data...");
        //     void pollEpaMonitorsData();
        // }, POLLING_INTERVAL_MS);
        //
        // // // Run the function immediately on startup
        // void pollEpaMonitorsData();


    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1); // Exit if DB connection fails
    }
};

// Start the server
void startServer();
