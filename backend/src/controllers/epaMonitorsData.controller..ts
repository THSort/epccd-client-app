import {Request, Response} from "express";
import {fetchCurrentEpaMonitorsDataForLocation, fetchHistoricalEpaMonitorsDataForLocation, fetchHistoricalEpaMonitorsDataByPeriods} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";
import {EpaMonitorsData, PollutantChartData, FilteredHistoricalDataResponse} from "../types/epaMonitorsData.types";

export const getCurrentEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);

        const aqmsData = await fetchCurrentEpaMonitorsDataForLocation(location);

        res.json(aqmsData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching EPA Monitors data for location ${req.query.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching EPA Monitors data for location ${req.query.location}`);
        }
        res.status(500).json({message: "Failed to fetch EPA Monitors data"});
    }
};

export const getHistoricalEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);
        const currentDate = new Date().toISOString().split('T')[0];
        
        const historicalData = await fetchHistoricalEpaMonitorsDataByPeriods(location, currentDate);
        
        // Filter the data to include only the required fields
        const filteredData: FilteredHistoricalDataResponse = {
            // Process oneDay data into 6 time-based data points with averaged values
            oneDay: processOneDayData(historicalData.oneDay),
            // Process oneWeek data into 7 day-based data points with averaged values
            oneWeek: processOneWeekData(historicalData.oneWeek),
            // Process oneMonth data into 4 weekly data points with averaged values
            oneMonth: processOneMonthData(historicalData.oneMonth),
            // Process threeMonths data into month-based data points
            threeMonths: processMonthlyData(historicalData.threeMonths, 3),
            // Process sixMonths data into month-based data points
            sixMonths: processMonthlyData(historicalData.sixMonths, 6),
            // Process oneYear data into quarterly data points
            oneYear: processQuarterlyData(historicalData.oneYear)
        };
        
        res.json(filteredData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching historical EPA Monitors data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching historical EPA Monitors data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch historical EPA Monitors data"});
    }
};

// Helper function to filter only the required fields for the chart
const filterPollutantData = (data: EpaMonitorsData[]): PollutantChartData[] => {
    return data.map(item => ({
        // Date and time fields
        report_date: item.report_date,
        report_time: item.report_time,
        
        // Pollutant concentration fields
        o3_ppb: item.o3_ppb,
        co_ppm: item.co_ppm,
        so2_ppb: item.so2_ppb,
        no_ppb: item.no_ppb,
        no2_ppb: item.no2_ppb,
        nox_ppb: item.nox_ppb,
        pm10_ug_m3: item.pm10_ug_m3,
        pm2_5_ug_m3: item.pm2_5_ug_m3,
        
        // AQI values
        PM2_5_AQI: item.PM2_5_AQI,
        PM10_AQI: item.PM10_AQI,
        SO2_AQI: item.SO2_AQI,
        NO2_AQI: item.NO2_AQI,
        O3_AQI: item.O3_AQI,
        CO_AQI: item.CO_AQI
    }));
};

// Process oneDay data into 6 time-based data points with averaged values
const processOneDayData = (data: EpaMonitorsData[]): Record<string, PollutantChartData> => {
    // Define the 6 time slots (4-hour intervals)
    const timeSlots = [
        { label: '12 AM', hour: 0 },
        { label: '4 AM', hour: 4 },
        { label: '8 AM', hour: 8 },
        { label: '12 PM', hour: 12 },
        { label: '4 PM', hour: 16 },
        { label: '8 PM', hour: 20 }
    ];
    
    // Initialize result object with empty data for each time slot
    const result: Record<string, PollutantChartData> = {};
    
    // Initialize counters and accumulators for each time slot
    const slotData: Record<string, { 
        count: number,
        o3_ppb: number,
        co_ppm: number,
        so2_ppb: number,
        no_ppb: number,
        no2_ppb: number,
        nox_ppb: number,
        pm10_ug_m3: number,
        pm2_5_ug_m3: number,
        PM2_5_AQI: number,
        PM10_AQI: number,
        SO2_AQI: number,
        NO2_AQI: number,
        O3_AQI: number,
        CO_AQI: number
    }> = {};
    
    // Initialize slot data
    timeSlots.forEach(slot => {
        slotData[slot.label] = {
            count: 0,
            o3_ppb: 0,
            co_ppm: 0,
            so2_ppb: 0,
            no_ppb: 0,
            no2_ppb: 0,
            nox_ppb: 0,
            pm10_ug_m3: 0,
            pm2_5_ug_m3: 0,
            PM2_5_AQI: 0,
            PM10_AQI: 0,
            SO2_AQI: 0,
            NO2_AQI: 0,
            O3_AQI: 0,
            CO_AQI: 0
        };
    });
    
    // Process each data point and add to the appropriate time slot
    data.forEach(item => {
        // Extract hour from report_time (assuming format like "HH:MM:SS")
        const timeParts = item.report_time.split(':');
        const hour = parseInt(timeParts[0], 10);
        
        // Determine which time slot this hour belongs to
        let slotLabel = '';
        for (let i = 0; i < timeSlots.length; i++) {
            const currentSlot = timeSlots[i];
            const nextSlot = timeSlots[(i + 1) % timeSlots.length];
            
            // Handle the case where we wrap around from 8 PM to 12 AM
            if (nextSlot.hour < currentSlot.hour) {
                if (hour >= currentSlot.hour || hour < nextSlot.hour) {
                    slotLabel = currentSlot.label;
                    break;
                }
            } else if (hour >= currentSlot.hour && hour < nextSlot.hour) {
                slotLabel = currentSlot.label;
                break;
            }
        }
        
        // If we couldn't determine a slot, use the last one (8 PM)
        if (!slotLabel) {
            slotLabel = timeSlots[timeSlots.length - 1].label;
        }
        
        // Add data to the slot
        slotData[slotLabel].count++;
        slotData[slotLabel].o3_ppb += item.o3_ppb || 0;
        slotData[slotLabel].co_ppm += item.co_ppm || 0;
        slotData[slotLabel].so2_ppb += item.so2_ppb || 0;
        slotData[slotLabel].no_ppb += item.no_ppb || 0;
        slotData[slotLabel].no2_ppb += item.no2_ppb || 0;
        slotData[slotLabel].nox_ppb += item.nox_ppb || 0;
        slotData[slotLabel].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        slotData[slotLabel].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        slotData[slotLabel].PM2_5_AQI += item.PM2_5_AQI || 0;
        slotData[slotLabel].PM10_AQI += item.PM10_AQI || 0;
        slotData[slotLabel].SO2_AQI += item.SO2_AQI || 0;
        slotData[slotLabel].NO2_AQI += item.NO2_AQI || 0;
        slotData[slotLabel].O3_AQI += item.O3_AQI || 0;
        slotData[slotLabel].CO_AQI += item.CO_AQI || 0;
    });
    
    // Get the current date from the data or use today's date
    const currentDate = data.length > 0 ? data[0].report_date : new Date().toISOString().split('T')[0];
    
    // Create entries for all time slots, even if they have no data
    timeSlots.forEach(slot => {
        const slotInfo = slotData[slot.label];
        
        if (slotInfo.count > 0) {
            // Calculate averages for slots that have data
            result[slot.label] = {
                report_date: currentDate,
                report_time: slot.label,
                o3_ppb: slotInfo.o3_ppb / slotInfo.count,
                co_ppm: slotInfo.co_ppm / slotInfo.count,
                so2_ppb: slotInfo.so2_ppb / slotInfo.count,
                no_ppb: slotInfo.no_ppb / slotInfo.count,
                no2_ppb: slotInfo.no2_ppb / slotInfo.count,
                nox_ppb: slotInfo.nox_ppb / slotInfo.count,
                pm10_ug_m3: slotInfo.pm10_ug_m3 / slotInfo.count,
                pm2_5_ug_m3: slotInfo.pm2_5_ug_m3 / slotInfo.count,
                PM2_5_AQI: slotInfo.PM2_5_AQI / slotInfo.count,
                PM10_AQI: slotInfo.PM10_AQI / slotInfo.count,
                SO2_AQI: slotInfo.SO2_AQI / slotInfo.count,
                NO2_AQI: slotInfo.NO2_AQI / slotInfo.count,
                O3_AQI: slotInfo.O3_AQI / slotInfo.count,
                CO_AQI: slotInfo.CO_AQI / slotInfo.count
            };
        } else {
            // For slots with no data, use zero values
            result[slot.label] = {
                report_date: currentDate,
                report_time: slot.label,
                o3_ppb: 0,
                co_ppm: 0,
                so2_ppb: 0,
                no_ppb: 0,
                no2_ppb: 0,
                nox_ppb: 0,
                pm10_ug_m3: 0,
                pm2_5_ug_m3: 0,
                PM2_5_AQI: 0,
                PM10_AQI: 0,
                SO2_AQI: 0,
                NO2_AQI: 0,
                O3_AQI: 0,
                CO_AQI: 0
            };
        }
    });
    
    return result;
};

// Process oneWeek data into 7 day-based data points with averaged values
const processOneWeekData = (data: EpaMonitorsData[]): Record<string, PollutantChartData> => {
    // Define the 7 days of the week
    const daysOfWeek = [
        { label: 'Sunday', dayIndex: 0 },
        { label: 'Monday', dayIndex: 1 },
        { label: 'Tuesday', dayIndex: 2 },
        { label: 'Wednesday', dayIndex: 3 },
        { label: 'Thursday', dayIndex: 4 },
        { label: 'Friday', dayIndex: 5 },
        { label: 'Saturday', dayIndex: 6 }
    ];
    
    // Initialize result object with empty data for each day
    const result: Record<string, PollutantChartData> = {};
    
    // Initialize counters and accumulators for each day
    const dayData: Record<string, { 
        count: number,
        o3_ppb: number,
        co_ppm: number,
        so2_ppb: number,
        no_ppb: number,
        no2_ppb: number,
        nox_ppb: number,
        pm10_ug_m3: number,
        pm2_5_ug_m3: number,
        PM2_5_AQI: number,
        PM10_AQI: number,
        SO2_AQI: number,
        NO2_AQI: number,
        O3_AQI: number,
        CO_AQI: number
    }> = {};
    
    // Initialize day data
    daysOfWeek.forEach(day => {
        dayData[day.label] = {
            count: 0,
            o3_ppb: 0,
            co_ppm: 0,
            so2_ppb: 0,
            no_ppb: 0,
            no2_ppb: 0,
            nox_ppb: 0,
            pm10_ug_m3: 0,
            pm2_5_ug_m3: 0,
            PM2_5_AQI: 0,
            PM10_AQI: 0,
            SO2_AQI: 0,
            NO2_AQI: 0,
            O3_AQI: 0,
            CO_AQI: 0
        };
    });
    
    // Process each data point and add to the appropriate day
    data.forEach(item => {
        // Extract day of week from report_date (assuming format like "YYYY-MM-DD")
        const date = new Date(item.report_date);
        const dayOfWeek = daysOfWeek[date.getDay()].label;
        
        // Add data to the day
        dayData[dayOfWeek].count++;
        dayData[dayOfWeek].o3_ppb += item.o3_ppb || 0;
        dayData[dayOfWeek].co_ppm += item.co_ppm || 0;
        dayData[dayOfWeek].so2_ppb += item.so2_ppb || 0;
        dayData[dayOfWeek].no_ppb += item.no_ppb || 0;
        dayData[dayOfWeek].no2_ppb += item.no2_ppb || 0;
        dayData[dayOfWeek].nox_ppb += item.nox_ppb || 0;
        dayData[dayOfWeek].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        dayData[dayOfWeek].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        dayData[dayOfWeek].PM2_5_AQI += item.PM2_5_AQI || 0;
        dayData[dayOfWeek].PM10_AQI += item.PM10_AQI || 0;
        dayData[dayOfWeek].SO2_AQI += item.SO2_AQI || 0;
        dayData[dayOfWeek].NO2_AQI += item.NO2_AQI || 0;
        dayData[dayOfWeek].O3_AQI += item.O3_AQI || 0;
        dayData[dayOfWeek].CO_AQI += item.CO_AQI || 0;
    });
    
    // Get the current date from the data or use today's date
    const currentDate = data.length > 0 ? data[0].report_date : new Date().toISOString().split('T')[0];
    
    // Create entries for all days, even if they have no data
    daysOfWeek.forEach(day => {
        const dayInfo = dayData[day.label];
        
        if (dayInfo.count > 0) {
            // Calculate averages for days that have data
            result[day.label] = {
                report_date: currentDate,
                report_time: day.label, // Using report_time field to store the day name
                o3_ppb: dayInfo.o3_ppb / dayInfo.count,
                co_ppm: dayInfo.co_ppm / dayInfo.count,
                so2_ppb: dayInfo.so2_ppb / dayInfo.count,
                no_ppb: dayInfo.no_ppb / dayInfo.count,
                no2_ppb: dayInfo.no2_ppb / dayInfo.count,
                nox_ppb: dayInfo.nox_ppb / dayInfo.count,
                pm10_ug_m3: dayInfo.pm10_ug_m3 / dayInfo.count,
                pm2_5_ug_m3: dayInfo.pm2_5_ug_m3 / dayInfo.count,
                PM2_5_AQI: dayInfo.PM2_5_AQI / dayInfo.count,
                PM10_AQI: dayInfo.PM10_AQI / dayInfo.count,
                SO2_AQI: dayInfo.SO2_AQI / dayInfo.count,
                NO2_AQI: dayInfo.NO2_AQI / dayInfo.count,
                O3_AQI: dayInfo.O3_AQI / dayInfo.count,
                CO_AQI: dayInfo.CO_AQI / dayInfo.count
            };
        } else {
            // For days with no data, use zero values
            result[day.label] = {
                report_date: currentDate,
                report_time: day.label, // Using report_time field to store the day name
                o3_ppb: 0,
                co_ppm: 0,
                so2_ppb: 0,
                no_ppb: 0,
                no2_ppb: 0,
                nox_ppb: 0,
                pm10_ug_m3: 0,
                pm2_5_ug_m3: 0,
                PM2_5_AQI: 0,
                PM10_AQI: 0,
                SO2_AQI: 0,
                NO2_AQI: 0,
                O3_AQI: 0,
                CO_AQI: 0
            };
        }
    });
    
    return result;
};

// Process oneMonth data into 4 weekly data points with averaged values
const processOneMonthData = (data: EpaMonitorsData[]): Record<string, PollutantChartData> => {
    // Sort data by date to ensure chronological order
    const sortedData = [...data].sort((a, b) => {
        return new Date(a.report_date).getTime() - new Date(b.report_date).getTime();
    });
    
    // If no data, return empty object
    if (sortedData.length === 0) {
        return {};
    }
    
    // Get the date range
    const startDate = new Date(sortedData[0].report_date);
    const endDate = new Date(sortedData[sortedData.length - 1].report_date);
    
    // Calculate the total number of days in the range
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate the number of days per week (divide total days by 4)
    const daysPerWeek = Math.ceil(totalDays / 4);
    
    // Initialize result object
    const result: Record<string, PollutantChartData> = {};
    
    // Initialize accumulators for each week
    const weekData: Record<number, { 
        count: number,
        startDate: Date,
        endDate: Date,
        o3_ppb: number,
        co_ppm: number,
        so2_ppb: number,
        no_ppb: number,
        no2_ppb: number,
        nox_ppb: number,
        pm10_ug_m3: number,
        pm2_5_ug_m3: number,
        PM2_5_AQI: number,
        PM10_AQI: number,
        SO2_AQI: number,
        NO2_AQI: number,
        O3_AQI: number,
        CO_AQI: number
    }> = {};
    
    // Initialize week data for 4 weeks
    for (let i = 0; i < 4; i++) {
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + i * daysPerWeek);
        
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + daysPerWeek - 1);
        
        // Ensure the last week doesn't go beyond the end date
        if (i === 3) {
            weekEndDate.setTime(endDate.getTime());
        }
        
        weekData[i] = {
            count: 0,
            startDate: weekStartDate,
            endDate: weekEndDate,
            o3_ppb: 0,
            co_ppm: 0,
            so2_ppb: 0,
            no_ppb: 0,
            no2_ppb: 0,
            nox_ppb: 0,
            pm10_ug_m3: 0,
            pm2_5_ug_m3: 0,
            PM2_5_AQI: 0,
            PM10_AQI: 0,
            SO2_AQI: 0,
            NO2_AQI: 0,
            O3_AQI: 0,
            CO_AQI: 0
        };
    }
    
    // Process each data point and add to the appropriate week
    sortedData.forEach(item => {
        const itemDate = new Date(item.report_date);
        
        // Determine which week this data point belongs to
        let weekIndex = -1;
        for (let i = 0; i < 4; i++) {
            const weekInfo = weekData[i];
            if (itemDate >= weekInfo.startDate && itemDate <= weekInfo.endDate) {
                weekIndex = i;
                break;
            }
        }
        
        // If we couldn't determine a week, skip this data point
        if (weekIndex === -1) {
            return;
        }
        
        // Add data to the week
        weekData[weekIndex].count++;
        weekData[weekIndex].o3_ppb += item.o3_ppb || 0;
        weekData[weekIndex].co_ppm += item.co_ppm || 0;
        weekData[weekIndex].so2_ppb += item.so2_ppb || 0;
        weekData[weekIndex].no_ppb += item.no_ppb || 0;
        weekData[weekIndex].no2_ppb += item.no2_ppb || 0;
        weekData[weekIndex].nox_ppb += item.nox_ppb || 0;
        weekData[weekIndex].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        weekData[weekIndex].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        weekData[weekIndex].PM2_5_AQI += item.PM2_5_AQI || 0;
        weekData[weekIndex].PM10_AQI += item.PM10_AQI || 0;
        weekData[weekIndex].SO2_AQI += item.SO2_AQI || 0;
        weekData[weekIndex].NO2_AQI += item.NO2_AQI || 0;
        weekData[weekIndex].O3_AQI += item.O3_AQI || 0;
        weekData[weekIndex].CO_AQI += item.CO_AQI || 0;
    });
    
    // Format date as MM/DD
    const formatDate = (date: Date): string => {
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const day = date.getDate();
        return `${month}/${day}`;
    };
    
    // Create entries for all weeks
    for (let i = 0; i < 4; i++) {
        const weekInfo = weekData[i];
        const weekLabel = `${formatDate(weekInfo.startDate)} - ${formatDate(weekInfo.endDate)}`;
        
        if (weekInfo.count > 0) {
            // Calculate averages for weeks that have data
            result[weekLabel] = {
                report_date: weekInfo.startDate.toISOString().split('T')[0],
                report_time: weekLabel, // Using report_time field to store the week label
                o3_ppb: weekInfo.o3_ppb / weekInfo.count,
                co_ppm: weekInfo.co_ppm / weekInfo.count,
                so2_ppb: weekInfo.so2_ppb / weekInfo.count,
                no_ppb: weekInfo.no_ppb / weekInfo.count,
                no2_ppb: weekInfo.no2_ppb / weekInfo.count,
                nox_ppb: weekInfo.nox_ppb / weekInfo.count,
                pm10_ug_m3: weekInfo.pm10_ug_m3 / weekInfo.count,
                pm2_5_ug_m3: weekInfo.pm2_5_ug_m3 / weekInfo.count,
                PM2_5_AQI: weekInfo.PM2_5_AQI / weekInfo.count,
                PM10_AQI: weekInfo.PM10_AQI / weekInfo.count,
                SO2_AQI: weekInfo.SO2_AQI / weekInfo.count,
                NO2_AQI: weekInfo.NO2_AQI / weekInfo.count,
                O3_AQI: weekInfo.O3_AQI / weekInfo.count,
                CO_AQI: weekInfo.CO_AQI / weekInfo.count
            };
        } else {
            // For weeks with no data, use zero values
            result[weekLabel] = {
                report_date: weekInfo.startDate.toISOString().split('T')[0],
                report_time: weekLabel, // Using report_time field to store the week label
                o3_ppb: 0,
                co_ppm: 0,
                so2_ppb: 0,
                no_ppb: 0,
                no2_ppb: 0,
                nox_ppb: 0,
                pm10_ug_m3: 0,
                pm2_5_ug_m3: 0,
                PM2_5_AQI: 0,
                PM10_AQI: 0,
                SO2_AQI: 0,
                NO2_AQI: 0,
                O3_AQI: 0,
                CO_AQI: 0
            };
        }
    }
    
    return result;
};

// Process data into month-based data points with averaged values
const processMonthlyData = (data: EpaMonitorsData[], numMonths: number): Record<string, PollutantChartData> => {
    // Sort data by date to ensure chronological order
    const sortedData = [...data].sort((a, b) => {
        return new Date(a.report_date).getTime() - new Date(b.report_date).getTime();
    });
    
    // If no data, return empty object
    if (sortedData.length === 0) {
        return {};
    }
    
    // Initialize result object
    const result: Record<string, PollutantChartData> = {};
    
    // Initialize accumulators for each month
    const monthData: Record<string, { 
        count: number,
        o3_ppb: number,
        co_ppm: number,
        so2_ppb: number,
        no_ppb: number,
        no2_ppb: number,
        nox_ppb: number,
        pm10_ug_m3: number,
        pm2_5_ug_m3: number,
        PM2_5_AQI: number,
        PM10_AQI: number,
        SO2_AQI: number,
        NO2_AQI: number,
        O3_AQI: number,
        CO_AQI: number
    }> = {};
    
    // Month names for labels
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Process each data point and add to the appropriate month
    sortedData.forEach(item => {
        const date = new Date(item.report_date);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        // Initialize month data if it doesn't exist
        if (!monthData[monthYear]) {
            monthData[monthYear] = {
                count: 0,
                o3_ppb: 0,
                co_ppm: 0,
                so2_ppb: 0,
                no_ppb: 0,
                no2_ppb: 0,
                nox_ppb: 0,
                pm10_ug_m3: 0,
                pm2_5_ug_m3: 0,
                PM2_5_AQI: 0,
                PM10_AQI: 0,
                SO2_AQI: 0,
                NO2_AQI: 0,
                O3_AQI: 0,
                CO_AQI: 0
            };
        }
        
        // Add data to the month
        monthData[monthYear].count++;
        monthData[monthYear].o3_ppb += item.o3_ppb || 0;
        monthData[monthYear].co_ppm += item.co_ppm || 0;
        monthData[monthYear].so2_ppb += item.so2_ppb || 0;
        monthData[monthYear].no_ppb += item.no_ppb || 0;
        monthData[monthYear].no2_ppb += item.no2_ppb || 0;
        monthData[monthYear].nox_ppb += item.nox_ppb || 0;
        monthData[monthYear].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        monthData[monthYear].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        monthData[monthYear].PM2_5_AQI += item.PM2_5_AQI || 0;
        monthData[monthYear].PM10_AQI += item.PM10_AQI || 0;
        monthData[monthYear].SO2_AQI += item.SO2_AQI || 0;
        monthData[monthYear].NO2_AQI += item.NO2_AQI || 0;
        monthData[monthYear].O3_AQI += item.O3_AQI || 0;
        monthData[monthYear].CO_AQI += item.CO_AQI || 0;
    });
    
    // Get all month-year combinations
    const monthYears = Object.keys(monthData);
    
    // Sort month-years chronologically
    monthYears.sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        
        return dateA.getTime() - dateB.getTime();
    });
    
    // Limit to the most recent numMonths months
    const recentMonths = monthYears.slice(-numMonths);
    
    // Calculate averages for each month
    recentMonths.forEach(monthYear => {
        const monthInfo = monthData[monthYear];
        
        if (monthInfo.count > 0) {
            // Calculate averages for months that have data
            result[monthYear] = {
                report_date: monthYear, // Using report_date field to store the month-year
                report_time: monthYear, // Using report_time field to store the month-year
                o3_ppb: monthInfo.o3_ppb / monthInfo.count,
                co_ppm: monthInfo.co_ppm / monthInfo.count,
                so2_ppb: monthInfo.so2_ppb / monthInfo.count,
                no_ppb: monthInfo.no_ppb / monthInfo.count,
                no2_ppb: monthInfo.no2_ppb / monthInfo.count,
                nox_ppb: monthInfo.nox_ppb / monthInfo.count,
                pm10_ug_m3: monthInfo.pm10_ug_m3 / monthInfo.count,
                pm2_5_ug_m3: monthInfo.pm2_5_ug_m3 / monthInfo.count,
                PM2_5_AQI: monthInfo.PM2_5_AQI / monthInfo.count,
                PM10_AQI: monthInfo.PM10_AQI / monthInfo.count,
                SO2_AQI: monthInfo.SO2_AQI / monthInfo.count,
                NO2_AQI: monthInfo.NO2_AQI / monthInfo.count,
                O3_AQI: monthInfo.O3_AQI / monthInfo.count,
                CO_AQI: monthInfo.CO_AQI / monthInfo.count
            };
        }
    });
    
    return result;
};

// Process data into quarterly data points with averaged values
const processQuarterlyData = (data: EpaMonitorsData[]): Record<string, PollutantChartData> => {
    // Sort data by date to ensure chronological order
    const sortedData = [...data].sort((a, b) => {
        return new Date(a.report_date).getTime() - new Date(b.report_date).getTime();
    });
    
    // If no data, return empty object
    if (sortedData.length === 0) {
        return {};
    }
    
    // Initialize result object
    const result: Record<string, PollutantChartData> = {};
    
    // Month names for labels
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Define standard quarters
    const standardQuarters = [
        { label: 'January - March', startMonth: 0, endMonth: 2 },
        { label: 'April - June', startMonth: 3, endMonth: 5 },
        { label: 'July - September', startMonth: 6, endMonth: 8 },
        { label: 'October - December', startMonth: 9, endMonth: 11 }
    ];
    
    // Initialize accumulators for each quarter
    const quarterData: Record<string, { 
        count: number,
        o3_ppb: number,
        co_ppm: number,
        so2_ppb: number,
        no_ppb: number,
        no2_ppb: number,
        nox_ppb: number,
        pm10_ug_m3: number,
        pm2_5_ug_m3: number,
        PM2_5_AQI: number,
        PM10_AQI: number,
        SO2_AQI: number,
        NO2_AQI: number,
        O3_AQI: number,
        CO_AQI: number
    }> = {};
    
    // Initialize quarter data for standard quarters
    standardQuarters.forEach(quarter => {
        quarterData[quarter.label] = {
            count: 0,
            o3_ppb: 0,
            co_ppm: 0,
            so2_ppb: 0,
            no_ppb: 0,
            no2_ppb: 0,
            nox_ppb: 0,
            pm10_ug_m3: 0,
            pm2_5_ug_m3: 0,
            PM2_5_AQI: 0,
            PM10_AQI: 0,
            SO2_AQI: 0,
            NO2_AQI: 0,
            O3_AQI: 0,
            CO_AQI: 0
        };
    });
    
    // Process each data point and add to the appropriate quarter
    sortedData.forEach(item => {
        const date = new Date(item.report_date);
        const month = date.getMonth();
        
        // Determine which quarter this data point belongs to
        let quarterLabel = '';
        for (const quarter of standardQuarters) {
            if (month >= quarter.startMonth && month <= quarter.endMonth) {
                quarterLabel = quarter.label;
                break;
            }
        }
        
        // If we couldn't determine a quarter, skip this data point
        if (!quarterLabel) {
            return;
        }
        
        // Add data to the quarter
        quarterData[quarterLabel].count++;
        quarterData[quarterLabel].o3_ppb += item.o3_ppb || 0;
        quarterData[quarterLabel].co_ppm += item.co_ppm || 0;
        quarterData[quarterLabel].so2_ppb += item.so2_ppb || 0;
        quarterData[quarterLabel].no_ppb += item.no_ppb || 0;
        quarterData[quarterLabel].no2_ppb += item.no2_ppb || 0;
        quarterData[quarterLabel].nox_ppb += item.nox_ppb || 0;
        quarterData[quarterLabel].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        quarterData[quarterLabel].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        quarterData[quarterLabel].PM2_5_AQI += item.PM2_5_AQI || 0;
        quarterData[quarterLabel].PM10_AQI += item.PM10_AQI || 0;
        quarterData[quarterLabel].SO2_AQI += item.SO2_AQI || 0;
        quarterData[quarterLabel].NO2_AQI += item.NO2_AQI || 0;
        quarterData[quarterLabel].O3_AQI += item.O3_AQI || 0;
        quarterData[quarterLabel].CO_AQI += item.CO_AQI || 0;
    });
    
    // Calculate averages for each quarter
    standardQuarters.forEach(quarter => {
        const quarterInfo = quarterData[quarter.label];
        
        if (quarterInfo.count > 0) {
            // Calculate averages for quarters that have data
            result[quarter.label] = {
                report_date: new Date().toISOString().split('T')[0], // Using current date
                report_time: quarter.label, // Using report_time field to store the quarter label
                o3_ppb: quarterInfo.o3_ppb / quarterInfo.count,
                co_ppm: quarterInfo.co_ppm / quarterInfo.count,
                so2_ppb: quarterInfo.so2_ppb / quarterInfo.count,
                no_ppb: quarterInfo.no_ppb / quarterInfo.count,
                no2_ppb: quarterInfo.no2_ppb / quarterInfo.count,
                nox_ppb: quarterInfo.nox_ppb / quarterInfo.count,
                pm10_ug_m3: quarterInfo.pm10_ug_m3 / quarterInfo.count,
                pm2_5_ug_m3: quarterInfo.pm2_5_ug_m3 / quarterInfo.count,
                PM2_5_AQI: quarterInfo.PM2_5_AQI / quarterInfo.count,
                PM10_AQI: quarterInfo.PM10_AQI / quarterInfo.count,
                SO2_AQI: quarterInfo.SO2_AQI / quarterInfo.count,
                NO2_AQI: quarterInfo.NO2_AQI / quarterInfo.count,
                O3_AQI: quarterInfo.O3_AQI / quarterInfo.count,
                CO_AQI: quarterInfo.CO_AQI / quarterInfo.count
            };
        } else {
            // For quarters with no data, use zero values
            result[quarter.label] = {
                report_date: new Date().toISOString().split('T')[0], // Using current date
                report_time: quarter.label, // Using report_time field to store the quarter label
                o3_ppb: 0,
                co_ppm: 0,
                so2_ppb: 0,
                no_ppb: 0,
                no2_ppb: 0,
                nox_ppb: 0,
                pm10_ug_m3: 0,
                pm2_5_ug_m3: 0,
                PM2_5_AQI: 0,
                PM10_AQI: 0,
                SO2_AQI: 0,
                NO2_AQI: 0,
                O3_AQI: 0,
                CO_AQI: 0
            };
        }
    });
    
    return result;
};
