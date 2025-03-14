export interface EpaMonitorsData {
    id: number;
    location: number; // `mn`
    datatime: string; // `datatime`
    report_date: string; // `report_date`
    report_time: string; // `report_time`

    // Air Quality Fields
    o3_ppb: number; // `o3_ppb_field`
    co_ppm: number; // `co_ppm_field`
    so2_ppb: number; // `so2_ppb_field`
    no_ppb: number; // `no_ppb_field`
    no2_ppb: number; // `no2_ppb_field`
    nox_ppb: number; // `nox_ppb_field`
    pm10_ug_m3: number; // `pm10_ug_m3_field`
    pm2_5_ug_m3: number; // `pm2_5_ug_m3_field`

    // Weather Fields
    temperature: number; // `temperature_field`
    humidity: number; // `humidity_field`
    atmospheric_pressure_kpa: number; // `atmospheric_pressure_kpa_field`
    wind_speed_m_s: number; // `wind_speed_m_s_field`
    wind_direction: number; // `wind_direction_field`
    rainfall_mm: number; // `rainfall_mm_field`
    total_solar_radiation_w_m2: number; // `total_solar_radiation_w_m2_field`

    // AQI Values
    PM2_5_AQI: number; // `PM2.5_AQI`
    PM10_AQI: number; // `PM10_AQI`
    SO2_AQI: number; // `SO2_AQI`
    NO2_AQI: number; // `NO2_AQI`
    O3_AQI: number; // `O3_AQI`
    CO_AQI: number; // `CO_AQI`
}

export interface HistoricalEpaMonitorsDataResponse {
    oneDay: EpaMonitorsData[];
    oneWeek: EpaMonitorsData[];
    oneMonth: EpaMonitorsData[];
    threeMonths: EpaMonitorsData[];
    sixMonths: EpaMonitorsData[];
    oneYear: EpaMonitorsData[];
}

// Interface for filtered pollutant data for charts
export interface PollutantChartData {
    // Date and time fields
    report_date: string;
    report_time: string;
    
    // Pollutant concentration fields
    o3_ppb: number;
    co_ppm: number;
    so2_ppb: number;
    no_ppb: number;
    no2_ppb: number;
    nox_ppb: number;
    pm10_ug_m3: number;
    pm2_5_ug_m3: number;
    
    // AQI values
    PM2_5_AQI: number;
    PM10_AQI: number;
    SO2_AQI: number;
    NO2_AQI: number;
    O3_AQI: number;
    CO_AQI: number;
}

export interface FilteredHistoricalDataResponse {
    oneDay: Record<string, PollutantChartData>;
    oneWeek: Record<string, PollutantChartData>;
    oneMonth: Record<string, PollutantChartData>;
    threeMonths: Record<string, PollutantChartData>;
    sixMonths: Record<string, PollutantChartData>;
    oneYear: Record<string, PollutantChartData>;
}
