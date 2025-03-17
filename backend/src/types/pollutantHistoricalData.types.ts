// Define a type for the historical data response
import {PollutantBucketData} from "./epaMonitorsData.types";

export type PollutantHistoricalData = {
    oneDay: PollutantBucketData[];
    oneWeek: PollutantBucketData[];
    oneMonth: PollutantBucketData[];
    threeMonths: PollutantBucketData[];
    sixMonths: PollutantBucketData[];
    twelveMonths: PollutantBucketData[];
};