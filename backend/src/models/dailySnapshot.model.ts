import mongoose from "mongoose";

const snapshotItemSchema = new mongoose.Schema({
    datetime: {type: String},
    temperature_2m: {type: Number},
    relative_humidity_2m: {type: Number},
    dew_point_2m: {type: Number},
    apparent_temperature: {type: Number},
    precipitation_probability: {type: Number},
    precipitation: {type: Number},
    showers: {type: Number},
    rain: {type: Number},
    wind_speed_80m: {type: Number},
    wind_speed_10m: {type: Number},
    wind_speed_180m: {type: Number},
    wind_speed_120m: {type: Number},
    wind_direction_10m: {type: Number},
    wind_direction_80m: {type: Number},
    wind_direction_120m: {type: Number},
    wind_direction_180m: {type: Number},
    wind_gusts_10m: {type: Number},
    temperature_80m: {type: Number},
    temperature_120m: {type: Number},
    temperature_180m: {type: Number},
    weather_code: {type: Number},
    pressure_msl: {type: Number},
    surface_pressure: {type: Number},
    cloud_cover: {type: Number},
    cloud_cover_mid: {type: Number},
    cloud_cover_low: {type: Number},
    cloud_cover_high: {type: Number},
    visibility: {type: Number},
    evapotranspiration: {type: Number},
    et0_fao_evapotranspiration: {type: Number},
    vapour_pressure_deficit: {type: Number},
    soil_temperature_0cm: {type: Number},
    soil_temperature_6cm: {type: Number},
    soil_temperature_18cm: {type: Number},
    soil_temperature_54cm: {type: Number},
    soil_moisture_0_to_1cm: {type: Number},
    soil_moisture_1_to_3cm: {type: Number},
    soil_moisture_3_to_9cm: {type: Number},
    soil_moisture_9_to_27cm: {type: Number},
    soil_moisture_27_to_81cm: {type: Number},
    uv_index: {type: Number},
    uv_index_clear_sky: {type: Number},
    total_column_integrated_water_vapour: {type: Number},
    cape: {type: Number},
    lifted_index: {type: Number},
}, {_id: false});

const dailySnapshotSchema = new mongoose.Schema({
    snapshot_date: {type: String, required: true, index: true},
    location_id: {type: Number, required: true, index: true},
    future_forecast: [snapshotItemSchema],
    past_week: [snapshotItemSchema],
    created_at: {type: Date, default: Date.now, required: true}
}, {timestamps: true});

// Create a compound index for snapshot_date and location_id for faster lookups
dailySnapshotSchema.index({snapshot_date: 1, location_id: 1}, {unique: true});

const DailySnapshotModel = mongoose.model("daily_snapshot", dailySnapshotSchema, 'daily_snapshots');
export default DailySnapshotModel; 