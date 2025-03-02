import mongoose from "mongoose";

const epaMonitorsSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    location: {type: Number, required: true, index: true},
    datatime: {type: String, required: true, index: true},
    report_date: {type: String, required: true},
    report_time: {type: String, required: true},

    // Air Quality Fields
    o3_ppb: {type: Number, required: true},
    co_ppm: {type: Number, required: true},
    so2_ppb: {type: Number, required: true},
    no_ppb: {type: Number, required: true},
    no2_ppb: {type: Number, required: true},
    nox_ppb: {type: Number, required: true},
    pm10_ug_m3: {type: Number, required: true},
    pm2_5_ug_m3: {type: Number, required: true},

    // Weather Fields
    temperature: {type: Number, required: true},
    humidity: {type: Number, required: true},
    atmospheric_pressure_kpa: {type: Number, required: true},
    wind_speed_m_s: {type: Number, required: true},
    wind_direction: {type: Number, required: true},
    rainfall_mm: {type: Number, required: true},
    total_solar_radiation_w_m2: {type: Number, required: true},

    // AQI Values
    PM2_5_AQI: {type: Number, required: true},
    PM10_AQI: {type: Number, required: true},
    SO2_AQI: {type: Number, required: true},
    NO2_AQI: {type: Number, required: true},
    O3_AQI: {type: Number, required: true},
    CO_AQI: {type: Number, required: true}
}, {timestamps: true});

const EpaMonitorsDataModel = mongoose.model("epa_monitors_data", epaMonitorsSchema, 'epa_monitors_data');
export default EpaMonitorsDataModel;
