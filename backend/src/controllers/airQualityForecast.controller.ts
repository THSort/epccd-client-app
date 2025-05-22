import {Request, Response} from "express";
import logger from "../utils/logger";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";
import {Parser} from 'json2csv';
import * as fs from 'fs';
import {exec} from "node:child_process";
import path from "node:path";
import {parse} from "csv-parse/sync";


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

    const parser = new Parser({fields});
    const csv = parser.parse(data);

    const tempDir = path.join(__dirname, '../../temp');
    const inputCsvPath = path.join(tempDir, 'epa_data.csv');
    const outputCsvPath = path.join(tempDir, 'forecast_output.csv');
    const rScriptPath = path.join(__dirname, '../scripts/forecasting_model.R');

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    fs.writeFileSync(inputCsvPath, csv);
    logger.info('✅ CSV ready, now calling R script...')
    console.log('✅ CSV ready, now calling R script...');

    // Run the R script
    exec(`Rscript ${rScriptPath} ${inputCsvPath} ${outputCsvPath}`, (error, stdout, stderr) => {
        // Clean up input file regardless of result
        if (fs.existsSync(inputCsvPath)) {
            fs.unlinkSync(inputCsvPath);
        }

        if (error) {
            logger.error(`❌ R script error: ${error.message}`);
            return res.status(500).json({success: false, message: 'R script failed', error: error.message});
        }

        if (stderr) {
            logger.warn(`⚠️ R script stderr: ${stderr}`);
        }

        logger.info('✅ Forecasting model executed successfully');

        // Read and parse forecast_output.csv
        if (!fs.existsSync(outputCsvPath)) {
            return res.status(500).json({success: false, message: 'Output file not found'});
        }

        try {
            const csvData = fs.readFileSync(outputCsvPath, 'utf-8');
            const records = parse(csvData, {
                columns: true,
                skip_empty_lines: true
            });

            logger.info('✅ Forecasting model executed and parsed successfully');

            // await handleAlerts(records);
            // await storeForecastInDatabase(records);

            return res.status(200).json({
                success: true,
                message: 'Air quality forecast complete',
                forecast: records
            });
        } catch (readErr) {
            if (readErr instanceof Error) {
                logger.error(`❌ Failed to read or parse output CSV: ${readErr.message}`);
            } else {
                logger.error(`❌ Unknown error! Failed to read or parse output CSV`);
            }

            return res.status(500).json({success: false, message: 'Failed to parse output'});
        }
    });
}