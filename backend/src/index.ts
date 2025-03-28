import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import {PORT} from "./config/dotenv";
import {connectDB} from "./config/db";
import exampleRoutes from "./routes/exampleRoutes";
import userRoutes from "./routes/user.routes";
import epaMonitorsDataRoutes from "./routes/epaMonitorsData.routes";
import demographicSurveyRoutes from "./routes/demographicSurvey.routes";
import userActivityRoutes from "./routes/userActivity.routes";
import {fetchWeatherApi} from 'openmeteo';
import {pollEpaMonitorsData} from "./services/epaMonitorsData.service";

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
        app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));

        // Start polling EPA Monitors Data every 5 minutes
        const POLLING_INTERVAL_MS = 5 * 60 * 1000;
        setInterval(() => {
            console.log("📡 Polling EPA Monitors data...");
            void pollEpaMonitorsData();
        }, POLLING_INTERVAL_MS);

        // // Run the function immediately on startup
        void pollEpaMonitorsData();


    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1); // Exit if DB connection fails
    }
};

const weatherShit = async () => {
    const params = {
        "latitude": 52.52,
        "longitude": 13.41,
        "hourly": "temperature_2m",
        "start_date": "2025-03-14",
        "end_date": "2025-03-28"
    };
    const url = "https://api.open-meteo.com/v1/forecast";

    console.log('making request to mateo')
    const responses = await fetchWeatherApi(url, params);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
        Array.from({length: (stop - start) / step}, (_, i) => start + i * step);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const hourly = response.hourly()!;

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {

        hourly: {
            time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            temperature2m: hourly.variables(0)!.valuesArray()!,
        },

    };

    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    for (let i = 0; i < weatherData.hourly.time.length; i++) {
        console.log(
            weatherData.hourly.time[i].toISOString(),
            weatherData.hourly.temperature2m[i]
        );
    }
}

// Start the server
void startServer();

// void weatherShit();