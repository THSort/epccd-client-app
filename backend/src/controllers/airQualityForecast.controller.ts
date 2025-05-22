import {Request, Response} from "express";
import logger from "../utils/logger";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";
import {Parser} from 'json2csv';
import * as fs from 'fs';

export const runAirQualityForecastingModel = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Starting air quality forecast fetch and store operation`);

    console.log('Running AirQuality forecast model');

    const data = await EpaMonitorsDataModel.find(
        {},
        {
            location: 1,
            report_date_time: 1,
            o3_ppb: 1,
            co_ppm: 1,
            so2_ppb: 1,
            no_ppb: 1,
            no2_ppb: 1,
            nox_ppb: 1,
            pm10_ug_m3: 1,
            pm2_5_ug_m3: 1,
            temperature: 1,
            humidity: 1,
            atmospheric_pressure_kpa: 1,
            wind_speed_m_s: 1,
            wind_direction: 1,
            rainfall_mm: 1,
            total_solar_radiation_w_m2: 1,
            PM2_5_AQI: 1,
            PM10_AQI: 1,
            SO2_AQI: 1,
            NO2_AQI: 1,
            O3_AQI: 1,
            CO_AQI: 1,
            _id: 0 // Exclude MongoDB _id field
        }
    ).lean();

    // Specify the order of fields in the CSV
    const fields = [
        'location',
        'report_date_time',
        'o3_ppb',
        'co_ppm',
        'so2_ppb',
        'no_ppb',
        'no2_ppb',
        'nox_ppb',
        'pm10_ug_m3',
        'pm2_5_ug_m3',
        'temperature',
        'humidity',
        'atmospheric_pressure_kpa',
        'wind_speed_m_s',
        'wind_direction',
        'rainfall_mm',
        'total_solar_radiation_w_m2',
        'PM2_5_AQI',
        'PM10_AQI',
        'SO2_AQI',
        'NO2_AQI',
        'O3_AQI',
        'CO_AQI'
    ];

    const opts = {fields};

    // Convert to CSV
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    // Save to file
    fs.writeFileSync('epa_data.csv', csv);

    console.log('csv ready')
}