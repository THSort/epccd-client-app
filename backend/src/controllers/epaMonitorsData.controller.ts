import {Request, Response} from "express";
import {fetchCurrentEpaMonitorsDataForLocation, fetchPollutantSummaryForLocation} from "../services/epaMonitorsData.service";
import logger from "../utils/logger";
import {EpaMonitorsData, PollutantChartData, FilteredHistoricalDataResponse, PollutantSummaryData} from "../types/epaMonitorsData.types";
import EpaMonitorsDataModel from "../models/epaMonitorsData.model";

const getCurrentEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
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

const getPollutantSummaryForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);

        const summaryData = await fetchPollutantSummaryForLocation(location);

        res.json(summaryData);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching pollutant summary data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching pollutant summary data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch pollutant summary data"});
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

// Process oneDay data into 8 time-based data points with averaged values
const processOneDayData = (data: EpaMonitorsData[]): Record<string, PollutantChartData> => {
    // Define the 8 time slots (3-hour intervals)
    const timeSlots = [
        { label: '12 AM', hour: 0 },
        { label: '3 AM', hour: 3 },
        { label: '6 AM', hour: 6 },
        { label: '9 AM', hour: 9 },
        { label: '12 PM', hour: 12 },
        { label: '3 PM', hour: 15 },
        { label: '6 PM', hour: 18 },
        { label: '9 PM', hour: 21 }
    ];
    
    // Get current hour to filter out future time slots
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    
    // Find the current time slot
    let currentTimeSlot = '9 PM'; // Default to last slot
    for (let i = 0; i < timeSlots.length; i++) {
        const nextSlotIndex = i + 1;
        
        if (nextSlotIndex < timeSlots.length) {
            if (currentHour >= timeSlots[i].hour && currentHour < timeSlots[nextSlotIndex].hour) {
                currentTimeSlot = timeSlots[i].label;
                break;
            }
        } else if (currentHour >= timeSlots[i].hour) {
            currentTimeSlot = timeSlots[i].label;
        }
    }
    
    // Filter time slots to only include those up to the current time slot
    const availableTimeSlots = timeSlots.filter(slot => {
        const slotIndex = timeSlots.findIndex(s => s.label === slot.label);
        const currentSlotIndex = timeSlots.findIndex(s => s.label === currentTimeSlot);
        return slotIndex <= currentSlotIndex;
    });
    
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
    
    // Initialize slot data for available time slots
    availableTimeSlots.forEach(slot => {
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
        for (let i = 0; i < availableTimeSlots.length; i++) {
            const currentSlot = availableTimeSlots[i];
            const nextSlotIndex = i + 1;
            
            if (nextSlotIndex < availableTimeSlots.length) {
                if (hour >= currentSlot.hour && hour < availableTimeSlots[nextSlotIndex].hour) {
                    slotLabel = currentSlot.label;
                    break;
                }
            } else if (hour >= currentSlot.hour) {
                slotLabel = currentSlot.label;
            }
        }
        
        // If we couldn't determine a slot, skip this data point
        if (!slotLabel || !slotData[slotLabel]) {
            return;
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
    const currentDateStr = new Date().toISOString().split('T')[0];
    
    // Create entries for all available time slots
    availableTimeSlots.forEach(slot => {
        const slotInfo = slotData[slot.label];
        
        if (slotInfo && slotInfo.count > 0) {
            // Calculate averages for slots that have data
            result[slot.label] = {
                report_date: currentDateStr,
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
        } else if (slotInfo) {
            // For slots with no data, use zero values
            result[slot.label] = {
                report_date: currentDateStr,
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
    // Get current date
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    // Create an array of dates for the past 7 days (including today)
    const dates: { date: Date, label: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add today and yesterday with special labels
    dates.push({ date: new Date(currentDate), label: 'Today' });
    
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    dates.push({ date: yesterday, label: 'Yesterday' });
    
    // Add the remaining 5 days with day names
    for (let i = 2; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const label = dayNames[date.getDay()];
        dates.push({ date, label });
    }
    
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
    
    // Initialize day data for each date
    dates.forEach(({ label }) => {
        dayData[label] = {
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
        // Extract date from report_date (assuming format like "YYYY-MM-DD")
        const itemDate = new Date(item.report_date);
        
        // Find the matching date in our dates array
        const matchingDateObj = dates.find(d => 
            d.date.getFullYear() === itemDate.getFullYear() && 
            d.date.getMonth() === itemDate.getMonth() && 
            d.date.getDate() === itemDate.getDate()
        );
        
        // Skip if no matching date (data is outside our range)
        if (!matchingDateObj) {
            return;
        }
        
        const dayLabel = matchingDateObj.label;
        
        // Skip if we couldn't determine a label or if the label doesn't exist in dayData
        if (!dayLabel || !dayData[dayLabel]) {
            return;
        }
        
        // Add data to the day
        dayData[dayLabel].count++;
        dayData[dayLabel].o3_ppb += item.o3_ppb || 0;
        dayData[dayLabel].co_ppm += item.co_ppm || 0;
        dayData[dayLabel].so2_ppb += item.so2_ppb || 0;
        dayData[dayLabel].no_ppb += item.no_ppb || 0;
        dayData[dayLabel].no2_ppb += item.no2_ppb || 0;
        dayData[dayLabel].nox_ppb += item.nox_ppb || 0;
        dayData[dayLabel].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        dayData[dayLabel].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        dayData[dayLabel].PM2_5_AQI += item.PM2_5_AQI || 0;
        dayData[dayLabel].PM10_AQI += item.PM10_AQI || 0;
        dayData[dayLabel].SO2_AQI += item.SO2_AQI || 0;
        dayData[dayLabel].NO2_AQI += item.NO2_AQI || 0;
        dayData[dayLabel].O3_AQI += item.O3_AQI || 0;
        dayData[dayLabel].CO_AQI += item.CO_AQI || 0;
    });
    
    // Create entries for all days, even if they have no data
    dates.forEach(({ label }) => {
        const dayInfo = dayData[label];
        
        if (dayInfo && dayInfo.count > 0) {
            // Calculate averages for days that have data
            result[label] = {
                report_date: currentDateStr,
                report_time: label, // Using report_time field to store the day name
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
        } else if (dayInfo) {
            // For days with no data, use zero values
            result[label] = {
                report_date: currentDateStr,
                report_time: label, // Using report_time field to store the day name
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
    // Get current date
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    // Create 4 week periods going backwards from current date
    const weeks: { startDate: Date, endDate: Date, label: string }[] = [];
    
    // Week 1 (current week)
    const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const daysFromSunday = currentDayOfWeek; // Days since the start of the week
    
    const week1Start = new Date(currentDate);
    week1Start.setDate(currentDate.getDate() - daysFromSunday); // Go back to Sunday
    
    const week1End = new Date(currentDate);
    
    // Week 2
    const week2End = new Date(week1Start);
    week2End.setDate(week2End.getDate() - 1); // Day before week 1 start
    
    const week2Start = new Date(week2End);
    week2Start.setDate(week2Start.getDate() - 6); // Go back 7 days (inclusive of end date)
    
    // Week 3
    const week3End = new Date(week2Start);
    week3End.setDate(week3End.getDate() - 1); // Day before week 2 start
    
    const week3Start = new Date(week3End);
    week3Start.setDate(week3Start.getDate() - 6); // Go back 7 days (inclusive of end date)
    
    // Week 4
    const week4End = new Date(week3Start);
    week4End.setDate(week4End.getDate() - 1); // Day before week 3 start
    
    const week4Start = new Date(week4End);
    week4Start.setDate(week4Start.getDate() - 6); // Go back 7 days (inclusive of end date)
    
    // Format date as MM/DD
    const formatDate = (date: Date): string => {
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const day = date.getDate();
        return `${month}/${day}`;
    };
    
    // Add weeks to array with formatted labels
    weeks.push({
        startDate: week1Start,
        endDate: week1End,
        label: `${formatDate(week1Start)} - ${formatDate(week1End)}`
    });
    
    weeks.push({
        startDate: week2Start,
        endDate: week2End,
        label: `${formatDate(week2Start)} - ${formatDate(week2End)}`
    });
    
    weeks.push({
        startDate: week3Start,
        endDate: week3End,
        label: `${formatDate(week3Start)} - ${formatDate(week3End)}`
    });
    
    weeks.push({
        startDate: week4Start,
        endDate: week4End,
        label: `${formatDate(week4Start)} - ${formatDate(week4End)}`
    });
    
    // Initialize result object
    const result: Record<string, PollutantChartData> = {};
    
    // Initialize accumulators for each week
    const weekData: Record<string, { 
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
    
    // Initialize week data for each week
    weeks.forEach(week => {
        weekData[week.label] = {
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
    
    // Process each data point and add to the appropriate week
    data.forEach(item => {
        const itemDate = new Date(item.report_date);
        
        // Find the matching week
        const matchingWeek = weeks.find(week => 
            itemDate >= week.startDate && itemDate <= week.endDate
        );
        
        // Skip if no matching week
        if (!matchingWeek) {
            return;
        }
        
        const weekLabel = matchingWeek.label;
        
        // Add data to the week
        weekData[weekLabel].count++;
        weekData[weekLabel].o3_ppb += item.o3_ppb || 0;
        weekData[weekLabel].co_ppm += item.co_ppm || 0;
        weekData[weekLabel].so2_ppb += item.so2_ppb || 0;
        weekData[weekLabel].no_ppb += item.no_ppb || 0;
        weekData[weekLabel].no2_ppb += item.no2_ppb || 0;
        weekData[weekLabel].nox_ppb += item.nox_ppb || 0;
        weekData[weekLabel].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        weekData[weekLabel].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        weekData[weekLabel].PM2_5_AQI += item.PM2_5_AQI || 0;
        weekData[weekLabel].PM10_AQI += item.PM10_AQI || 0;
        weekData[weekLabel].SO2_AQI += item.SO2_AQI || 0;
        weekData[weekLabel].NO2_AQI += item.NO2_AQI || 0;
        weekData[weekLabel].O3_AQI += item.O3_AQI || 0;
        weekData[weekLabel].CO_AQI += item.CO_AQI || 0;
    });
    
    // Create entries for all weeks
    weeks.forEach(week => {
        const weekInfo = weekData[week.label];
        
        if (weekInfo && weekInfo.count > 0) {
            // Calculate averages for weeks that have data
            result[week.label] = {
                report_date: currentDateStr,
                report_time: week.label,
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
            result[week.label] = {
                report_date: currentDateStr,
                report_time: week.label,
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

// Process data into month-based data points with averaged values
const processMonthlyData = (data: EpaMonitorsData[], numMonths: number): Record<string, PollutantChartData> => {
    // Get current date
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    // Create an array of months going backwards from current month
    const months: { date: Date, label: string }[] = [];
    
    // Month names for labels
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Add current month and previous months
    for (let i = 0; i < numMonths; i++) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        
        // Set to first day of month for consistent comparison
        date.setDate(1);
        
        const monthName = monthNames[date.getMonth()];
        months.push({ date, label: monthName });
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
    
    // Initialize month data for each month
    months.forEach(month => {
        monthData[month.label] = {
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
    
    // Process each data point and add to the appropriate month
    data.forEach(item => {
        const itemDate = new Date(item.report_date);
        
        // Find the matching month
        const matchingMonth = months.find(month => 
            itemDate.getMonth() === month.date.getMonth() && 
            itemDate.getFullYear() === month.date.getFullYear()
        );
        
        // Skip if no matching month
        if (!matchingMonth) {
            return;
        }
        
        const monthLabel = matchingMonth.label;
        
        // Add data to the month
        monthData[monthLabel].count++;
        monthData[monthLabel].o3_ppb += item.o3_ppb || 0;
        monthData[monthLabel].co_ppm += item.co_ppm || 0;
        monthData[monthLabel].so2_ppb += item.so2_ppb || 0;
        monthData[monthLabel].no_ppb += item.no_ppb || 0;
        monthData[monthLabel].no2_ppb += item.no2_ppb || 0;
        monthData[monthLabel].nox_ppb += item.nox_ppb || 0;
        monthData[monthLabel].pm10_ug_m3 += item.pm10_ug_m3 || 0;
        monthData[monthLabel].pm2_5_ug_m3 += item.pm2_5_ug_m3 || 0;
        monthData[monthLabel].PM2_5_AQI += item.PM2_5_AQI || 0;
        monthData[monthLabel].PM10_AQI += item.PM10_AQI || 0;
        monthData[monthLabel].SO2_AQI += item.SO2_AQI || 0;
        monthData[monthLabel].NO2_AQI += item.NO2_AQI || 0;
        monthData[monthLabel].O3_AQI += item.O3_AQI || 0;
        monthData[monthLabel].CO_AQI += item.CO_AQI || 0;
    });
    
    // Create entries for all months
    months.forEach(month => {
        const monthInfo = monthData[month.label];
        
        if (monthInfo && monthInfo.count > 0) {
            // Calculate averages for months that have data
            result[month.label] = {
                report_date: currentDateStr,
                report_time: month.label,
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
        } else {
            // For months with no data, use zero values
            result[month.label] = {
                report_date: currentDateStr,
                report_time: month.label,
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

// Process data into quarterly data points with averaged values
const processQuarterlyData = (data: EpaMonitorsData[]): Record<string, PollutantChartData> => {
    // Get current date
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const currentYear = currentDate.getFullYear();
    
    // Define standard quarters with month ranges
    const quarters = [
        { label: 'January - March', startMonth: 0, endMonth: 2 },
        { label: 'April - June', startMonth: 3, endMonth: 5 },
        { label: 'July - September', startMonth: 6, endMonth: 8 },
        { label: 'October - December', startMonth: 9, endMonth: 11 }
    ];
    
    // Initialize result object
    const result: Record<string, PollutantChartData> = {};
    
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
    
    // Create labels with year for each quarter
    const quarterLabels: string[] = [];
    
    // Get current quarter
    const currentQuarterIndex = Math.floor(currentDate.getMonth() / 3);
    
    // Add quarters for the past year, starting from the current quarter and going backwards
    for (let i = 0; i < 4; i++) {
        // Calculate quarter index (0-3) going backwards from current quarter
        let quarterIndex = (currentQuarterIndex - i) % 4;
        if (quarterIndex < 0) quarterIndex += 4;
        
        // Calculate year (current year or previous year)
        const year = i <= currentQuarterIndex ? currentYear : currentYear - 1;
        
        // Create label with year
        const label = `${quarters[quarterIndex].label} ${year}`;
        quarterLabels.push(label);
        
        // Initialize data for this quarter
        quarterData[label] = {
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
    
    // Process each data point and add to the appropriate quarter
    data.forEach(item => {
        const itemDate = new Date(item.report_date);
        const itemMonth = itemDate.getMonth();
        const itemYear = itemDate.getFullYear();
        
        // Find the matching quarter
        const quarterIndex = Math.floor(itemMonth / 3);
        const quarterBase = quarters[quarterIndex].label;
        const quarterLabel = `${quarterBase} ${itemYear}`;
        
        // Skip if this quarter is not in our list
        if (!quarterData[quarterLabel]) {
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
    quarterLabels.forEach(label => {
        const quarterInfo = quarterData[label];
        
        if (quarterInfo.count > 0) {
            // Calculate averages for quarters that have data
            result[label] = {
                report_date: currentDateStr,
                report_time: label,
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
            result[label] = {
                report_date: currentDateStr,
                report_time: label,
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

const getHistoricalEpaMonitorsDataForLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const location = Number(req.params.location);
        
        // Get current date and time
        const currentDate = new Date();
        const currentDateStr = currentDate.toISOString().split('T')[0];
        const currentHour = currentDate.getHours();
        const currentMinute = currentDate.getMinutes();
        
        // Calculate dates for different time periods
        // One day ago
        const oneDayAgo = new Date(currentDate);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const oneDayAgoStr = oneDayAgo.toISOString().split('T')[0];
        
        // One week ago
        const oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
        
        // One month ago
        const oneMonthAgo = new Date(currentDate);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
        
        // Three months ago
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
        
        // Six months ago
        const sixMonthsAgo = new Date(currentDate);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        
        // One year ago
        const oneYearAgo = new Date(currentDate);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
        
        logger.info(`Fetching historical data for location ${location} up to ${currentDateStr}`);
        
        // Query MongoDB for all historical data up to one year ago
        const historicalData = await EpaMonitorsDataModel.find({
            location: location,
            report_date: {
                $gte: oneYearAgoStr,
                $lte: currentDateStr
            }
        }).sort({ report_date: 1, report_time: 1 }).lean() as EpaMonitorsData[];
        
        logger.info(`Found ${historicalData.length} historical records for location ${location}`);
        
        // Filter data to only include data up to the current time
        const filterByDateAndTime = (data: EpaMonitorsData[], startDate: string) => {
            return data.filter(item => {
                // Include all data from previous days
                if (item.report_date < currentDateStr && item.report_date >= startDate) {
                    return true;
                }
                
                // For the current day, only include data up to the current time
                if (item.report_date === currentDateStr) {
                    const itemTimeParts = item.report_time.split(':');
                    const itemHour = parseInt(itemTimeParts[0], 10);
                    const itemMinute = parseInt(itemTimeParts[1], 10);
                    
                    // Compare hours first, then minutes if hours are equal
                    if (itemHour < currentHour) {
                        return true;
                    } else if (itemHour === currentHour && itemMinute <= currentMinute) {
                        return true;
                    }
                }
                
                return false;
            });
        };
        
        // Filter data for each time period
        const oneDayData = filterByDateAndTime(historicalData, oneDayAgoStr);
        const oneWeekData = filterByDateAndTime(historicalData, oneWeekAgoStr);
        const oneMonthData = filterByDateAndTime(historicalData, oneMonthAgoStr);
        const threeMonthsData = filterByDateAndTime(historicalData, threeMonthsAgoStr);
        const sixMonthsData = filterByDateAndTime(historicalData, sixMonthsAgoStr);
        const oneYearData = filterByDateAndTime(historicalData, oneYearAgoStr);
        
        logger.info(`Filtered historical data by time periods for location ${location}:`);
        logger.info(`- One day: ${oneDayData.length} records`);
        logger.info(`- One week: ${oneWeekData.length} records`);
        logger.info(`- One month: ${oneMonthData.length} records`);
        logger.info(`- Three months: ${threeMonthsData.length} records`);
        logger.info(`- Six months: ${sixMonthsData.length} records`);
        logger.info(`- One year: ${oneYearData.length} records`);
        
        // Process data for each time period
        const result: FilteredHistoricalDataResponse = {
            oneDay: processOneDayData(oneDayData),
            oneWeek: processOneWeekData(oneWeekData),
            oneMonth: processOneMonthData(oneMonthData),
            threeMonths: processMonthlyData(threeMonthsData, 3),
            sixMonths: processMonthlyData(sixMonthsData, 6),
            oneYear: processQuarterlyData(oneYearData)
        };
        
        res.json(result);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching historical EPA Monitors data for location ${req.params.location}: ${error.message}`);
        } else {
            logger.error(`Unknown error while fetching historical EPA Monitors data for location ${req.params.location}`);
        }
        res.status(500).json({message: "Failed to fetch historical EPA Monitors data"});
    }
};

export {
    getCurrentEpaMonitorsDataForLocation,
    getPollutantSummaryForLocation,
    getHistoricalEpaMonitorsDataForLocation
};
