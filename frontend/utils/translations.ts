// Define types for our translations
export type Language = 'Eng' | 'اردو';

// Define the structure of our translations
export interface TranslationStrings {
  // Home screen
  airQualityIndex: string;
  viewDetailedReport: string;
  settings: string;
  selectLocation: string;
  
  // AQI descriptions
  good: string;
  moderate: string;
  unhealthyForSensitive: string;
  unhealthy: string;
  veryUnhealthy: string;
  hazardous: string;
  
  // Error messages
  failedToLoadAirQuality: string;
  noDataAvailable: string;
  failedToLoadHistoricalData: string;
  noHistoricalDataAvailable: string;
  
  // Other common strings
  loading: string;
  updated: string;
  justNow: string;
  minAgo: string;
  minsAgo: string;
  notUpdatedYet: string;
  
  // Air Quality Report screen
  airQualityReport: string;
  pollutantLevels: string;
  viewHistory: string;
  
  // Air Quality History screen
  airQualityHistory: string;
  concentration: string;
  aqi: string;
  currentValue: string;
  dailyAverage: string;
  weeklyAverage: string;
  
  // Time ranges
  day: string;
  week: string;
  month: string;
  threeMonths: string;
  sixMonths: string;
  year: string;
  
  // Pollutant names and descriptions
  pm25: string;
  pm25Description: string;
  pm10: string;
  pm10Description: string;
  o3: string;
  o3Description: string;
  so2: string;
  so2Description: string;
  no2: string;
  no2Description: string;
  co: string;
  coDescription: string;
  
  // Units
  ugm3: string;
  ppb: string;
  ppm: string;
  
  // City names
  lahore: string;
  islamabad: string;
  karachi: string;
  
  // Location names
  sagianRoadLahore: string;
  mahmoodBootiLahore: string;
  wwfFerozpurRoadLahore: string;
  egertonRoadLahore: string;
  hillParkLahore: string;
  
  // Digits
  digit0: string;
  digit1: string;
  digit2: string;
  digit3: string;
  digit4: string;
  digit5: string;
  digit6: string;
  digit7: string;
  digit8: string;
  digit9: string;
  decimalPoint: string;
}

// Define translations for each language
const translations: Record<Language, TranslationStrings> = {
  'Eng': {
    // Home screen
    airQualityIndex: 'Air Quality Index',
    viewDetailedReport: 'View Detailed Report',
    settings: 'Settings',
    selectLocation: 'Select Location',
    
    // AQI descriptions
    good: 'Good',
    moderate: 'Moderate',
    unhealthyForSensitive: 'Unhealthy for Sensitive Groups',
    unhealthy: 'Unhealthy',
    veryUnhealthy: 'Very Unhealthy',
    hazardous: 'Hazardous',
    
    // Error messages
    failedToLoadAirQuality: 'Failed to load air quality data. Please try again later.',
    noDataAvailable: 'No data available',
    failedToLoadHistoricalData: 'Failed to load historical air quality data. Please try again later.',
    noHistoricalDataAvailable: 'No historical data available',
    
    // Other common strings
    loading: 'Loading...',
    updated: 'Updated',
    justNow: 'Just now',
    minAgo: '1 min ago',
    minsAgo: '{mins} mins ago',
    notUpdatedYet: 'Not updated yet',
    
    // Air Quality Report screen
    airQualityReport: 'Air Quality Report',
    pollutantLevels: 'Pollutant Levels',
    viewHistory: 'View History',
    
    // Air Quality History screen
    airQualityHistory: 'Air Quality History',
    concentration: 'Concentration',
    aqi: 'AQI',
    currentValue: 'Current Value',
    dailyAverage: '24h Average',
    weeklyAverage: 'Weekly Average',
    
    // Time ranges
    day: '1 Day',
    week: '1 Week',
    month: '1 Month',
    threeMonths: '3 Months',
    sixMonths: '6 Months',
    year: '1 Year',
    
    // Pollutant names and descriptions
    pm25: 'PM₂.₅',
    pm25Description: 'Fine Particles',
    pm10: 'PM₁₀',
    pm10Description: 'Coarse Particles',
    o3: 'O₃',
    o3Description: 'Ozone',
    so2: 'SO₂',
    so2Description: 'Sulfur Dioxide',
    no2: 'NO₂',
    no2Description: 'Nitrogen Dioxide',
    co: 'CO',
    coDescription: 'Carbon Monoxide',
    
    // Units
    ugm3: 'μg/m³',
    ppb: 'ppb',
    ppm: 'ppm',
    
    // City names
    lahore: 'Lahore',
    islamabad: 'Islamabad',
    karachi: 'Karachi',
    
    // Location names
    sagianRoadLahore: 'Sagian Road, Lahore',
    mahmoodBootiLahore: 'Mahmood Booti, Lahore',
    wwfFerozpurRoadLahore: 'WWF Ferozpur Road, Lahore',
    egertonRoadLahore: 'Egerton Road, Lahore',
    hillParkLahore: 'Hill Park, Lahore',
    
    // Digits - English uses standard Arabic numerals
    digit0: '0',
    digit1: '1',
    digit2: '2',
    digit3: '3',
    digit4: '4',
    digit5: '5',
    digit6: '6',
    digit7: '7',
    digit8: '8',
    digit9: '9',
    decimalPoint: '.',
  },
  'اردو': {
    // Home screen
    airQualityIndex: 'ہوا کا معیار انڈیکس',
    viewDetailedReport: 'تفصیلی رپورٹ دیکھیں',
    settings: 'ترتیبات',
    selectLocation: 'مقام منتخب کریں',
    
    // AQI descriptions
    good: 'اچھا',
    moderate: 'معتدل',
    unhealthyForSensitive: 'حساس گروپوں کے لیے غیر صحت مند',
    unhealthy: 'غیر صحت مند',
    veryUnhealthy: 'بہت غیر صحت مند',
    hazardous: 'خطرناک',
    
    // Error messages
    failedToLoadAirQuality: 'ہوا کے معیار کا ڈیٹا لوڈ کرنے میں ناکام۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',
    noDataAvailable: 'کوئی ڈیٹا دستیاب نہیں ہے',
    failedToLoadHistoricalData: 'ہوا کے معیار کا تاریخی ڈیٹا لوڈ کرنے میں ناکام۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',
    noHistoricalDataAvailable: 'کوئی تاریخی ڈیٹا دستیاب نہیں ہے',
    
    // Other common strings
    loading: 'لوڈ ہو رہا ہے...',
    updated: 'اپ ڈیٹ شدہ',
    justNow: 'ابھی ابھی',
    minAgo: '1 منٹ پہلے',
    minsAgo: '{mins} منٹ پہلے',
    notUpdatedYet: 'ابھی تک اپڈیٹ نہیں ہوا',
    
    // Air Quality Report screen
    airQualityReport: 'ہوا کی معیار کی رپورٹ',
    pollutantLevels: 'آلودگی کی سطح',
    viewHistory: 'تاریخ دیکھیں',
    
    // Air Quality History screen
    airQualityHistory: 'ہوا کے معیار کی تاریخ',
    concentration: 'ارتکاز',
    aqi: 'اے کیو آئی',
    currentValue: 'موجودہ قیمت',
    dailyAverage: '24 گھنٹے کا اوسط',
    weeklyAverage: 'ہفتہ وار اوسط',
    
    // Time ranges
    day: '1 دن',
    week: '1 ہفتہ',
    month: '1 مہینہ',
    threeMonths: '3 مہینے',
    sixMonths: '6 مہینے',
    year: '1 سال',
    
    // Pollutant names and descriptions
    pm25: 'پی ایم₂.₅',
    pm25Description: 'باریک ذرات',
    pm10: 'پی ایم₁₀',
    pm10Description: 'موٹے ذرات',
    o3: 'او₃',
    o3Description: 'اوزون',
    so2: 'ایس او₂',
    so2Description: 'سلفر ڈائی آکسائیڈ',
    no2: 'این او₂',
    no2Description: 'نائٹروجن ڈائی آکسائیڈ',
    co: 'سی او',
    coDescription: 'کاربن مونو آکسائیڈ',
    
    // Units
    ugm3: 'μg/m³',
    ppb: 'ppb',
    ppm: 'ppm',
    
    // City names
    lahore: 'لاہور',
    islamabad: 'اسلام آباد',
    karachi: 'کراچی',
    
    // Location names
    sagianRoadLahore: 'ساگیاں روڈ، لاہور',
    mahmoodBootiLahore: 'محمود بوٹی، لاہور',
    wwfFerozpurRoadLahore: 'ڈبلیو ڈبلیو ایف فیروزپور روڈ، لاہور',
    egertonRoadLahore: 'ایجرٹن روڈ، لاہور',
    hillParkLahore: 'ہل پارک، لاہور',
    
    // Digits - Urdu/Eastern Arabic numerals
    digit0: '۰',
    digit1: '۱',
    digit2: '۲',
    digit3: '۳',
    digit4: '۴',
    digit5: '۵',
    digit6: '۶',
    digit7: '۷',
    digit8: '۸',
    digit9: '۹',
    decimalPoint: '٫',
  }
};

// Helper function to get translations based on selected language
export const getTranslation = (key: keyof TranslationStrings, language: Language): string => {
  return translations[language][key];
};

// Helper function to get all translations for a language
export const getTranslations = (language: Language): TranslationStrings => {
  return translations[language];
};

// Helper function to translate location names
export const getTranslatedLocationName = (locationName: string, language: Language): string => {
  // Map of English location names to translation keys
  const locationNameToKey: Record<string, keyof TranslationStrings | undefined> = {
    'Sagian Road, Lahore': 'sagianRoadLahore',
    'Mahmood Booti, Lahore': 'mahmoodBootiLahore',
    'WWF Ferozpur Road, Lahore': 'wwfFerozpurRoadLahore',
    'Egerton Road, Lahore': 'egertonRoadLahore',
    'Hill Park, Lahore': 'hillParkLahore',
    // Add more locations as needed
  };
  
  const key = locationNameToKey[locationName];
  
  // If we have a translation key for this location, use it
  if (key) {
    return getTranslation(key, language);
  }
  
  // Otherwise return the original location name
  return locationName;
};

// Helper function to translate city names
export const getTranslatedCityName = (cityName: string, language: Language): string => {
  // Map of English city names to translation keys
  const cityNameToKey: Record<string, keyof TranslationStrings | undefined> = {
    'Lahore': 'lahore',
    'Islamabad': 'islamabad',
    'Karachi': 'karachi',
    // Add more cities as needed
  };
  
  const key = cityNameToKey[cityName];
  
  // If we have a translation key for this city, use it
  if (key) {
    return getTranslation(key, language);
  }
  
  // Otherwise return the original city name
  return cityName;
};

// Helper function to format time with translations
export const getTranslatedTimeSinceUpdate = (lastUpdated: Date | null, language: Language): string => {
  if (!lastUpdated) {
    return getTranslation('notUpdatedYet', language);
  }

  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return getTranslation('justNow', language);
  }
  if (diffMins === 1) {
    return getTranslation('minAgo', language);
  }
  return getTranslation('minsAgo', language).replace('{mins}', getTranslatedNumber(diffMins.toString(), language));
};

// Helper function to translate numbers to the selected language
export const getTranslatedNumber = (number: string | number, language: Language): string => {
  // Convert the number to a string if it's not already
  const numStr = number.toString();
  
  // Replace each digit with its translated version
  let translatedNumber = '';
  for (let i = 0; i < numStr.length; i++) {
    const char = numStr[i];
    if (char === '.') {
      translatedNumber += getTranslation('decimalPoint', language);
    } else if (/\d/.test(char)) {
      // If the character is a digit (0-9), translate it
      const digitKey = `digit${char}` as keyof TranslationStrings;
      translatedNumber += getTranslation(digitKey, language);
    } else {
      // For any other character (like commas, spaces, etc.), keep it as is
      translatedNumber += char;
    }
  }
  
  return translatedNumber;
}; 