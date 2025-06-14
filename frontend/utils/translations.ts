// Define types for our translations
export type Language = 'Eng' | 'اردو';

// Define the structure of our translations
export interface TranslationStrings {
    tomorrowPrediction: string;
    tomorrowSame: string;
    tomorrowBetter: string;
    tomorrowWorse: string;

    // Home screen
    airQualityIndex: string;
    viewDetailedReport: string;
    settings: string;
    selectLocation: string;
    lastUpdated: string;
    outdatedDataWarning: string;

    // Settings screen
    locationForAlerts: string;
    receiveAlertsWhenAqiAbove: string;
    language: string;
    userIdNotFound: string;
    locationUpdateSuccess: string;
    locationUpdateError: string;
    thresholdUpdateSuccess: string;
    thresholdUpdateError: string;
    languageUpdateSuccess: string;
    languageUpdateError: string;
    selectAlertThreshold: string;

    // Registration screen
    selectAreaTitle: string;
    selectArea: string;
    mobileNumberTitle: string;
    mobileNumberPlaceholder: string;
    skip: string;
    skipAll: string;
    next: string;
    asthmaTitle: string;
    yes: string;
    no: string;
    settingUpAccount: string;
    pleaseSelectLocation: string;
    preparingNotifications: string;
    notificationTokenError: string;
    registrationError: string;
    invalidMobileNumber: string;
    invalidMobileNumberFormat: string;

    // Update screen
    updateRequired: string;
    currentVersion: string;
    latestVersion: string;
    updateMessage: string;
    downloadUpdate: string;
    copyDownloadLink: string;
    checkAgain: string;
    updateNotice: string;
    linkCopiedTitle: string;
    linkCopiedMessage: string;
    downloadUrlNotAvailable: string;
    unableToOpenLink: string;
    unableToOpenLinkMessage: string;
    failedToCopyLink: string;
    copySuccess: string;
    error: string;
    ok: string;

    // AQI descriptions
    good: string;
    satisfactory: string;
    moderate: string;
    unhealthyForSensitive: string;
    unhealthy: string;
    veryUnhealthy: string;
    hazardous: string;

    // Error messages
    pleaseRetryLater: string;
    failedToLoadAirQuality: string;
    failedToLoadMap: string;
    noDataAvailable: string;
    failedToLoadHistoricalData: string;
    failedToLoadSummaryData: string;
    noHistoricalDataAvailable: string;
    noForecastAvailable: string;
    failedToLoadForecast: string;

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
    today: string;
    yesterday: string;

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

    // Learn More screen
    learnMore: string;
    whatIsAirPollutionAndPM2_5_title: string;
    whatIsAirPollutionAndPM2_5_content: string;
    whyIsPM25Harmful_title: string;
    whyIsPM25Harmful_content: string;
    whyIsPM25Harmful_image_caption: string;
    whyShouldICare_title: string;
    whyShouldICare_content: string;
    whatDoesAQIMean_title: string;
    whatDoesAQIMean_content: string;
    whatCanIDo: string;
    contentComingSoon: string;
    protectiveMeasuresTitle: string;
    wearMask: string;
    stayIndoors: string;
    avoidBurning: string;
    avoidTraffic: string;

    // Health effects of PM2.5
    effect_breathing: string;
    effect_heart: string;
    effect_brain: string;
    effect_baby: string;
    effect_lifespan: string;
    effect_work: string;

    // AQI statements
    aqi_good_statement: string;
    aqi_satisfactory_statement: string;
    aqi_moderate_statement: string;
    aqi_unhealthy_sensitive_statement: string;
    aqi_unhealthy_statement: string;
    aqi_very_unhealthy_statement: string;
    aqi_hazardous_statement: string;

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
        tomorrowPrediction: "Tomorrow's Prediction",
        tomorrowSame: 'Similar air quality tomorrow',
        tomorrowBetter: 'Likely to get better',
        tomorrowWorse: 'Likely to get worse',
        // Home screen
        airQualityIndex: 'Air Quality Index',
        viewDetailedReport: 'View Detailed Report',
        settings: 'Settings',
        selectLocation: 'Select Location',
        lastUpdated: 'Last Updated',
        outdatedDataWarning: 'There was a problem connecting to the servers, so this data might be old',

        // Settings screen
        locationForAlerts: 'Location to receive alerts for',
        receiveAlertsWhenAqiAbove: 'Receive alerts when AQI is above',
        language: 'Language',
        userIdNotFound: 'User ID not found. Please restart the app.',
        locationUpdateSuccess: 'Location updated successfully',
        locationUpdateError: 'Failed to update location',
        thresholdUpdateSuccess: 'Alert threshold updated successfully',
        thresholdUpdateError: 'Failed to update alert threshold',
        languageUpdateSuccess: 'Language updated successfully',
        languageUpdateError: 'Failed to update language',
        selectAlertThreshold: 'Select alert threshold',

        // Registration screen
        selectAreaTitle: 'Which area do you want to receive AQI alerts for?',
        selectArea: 'Select Area',
        mobileNumberTitle: 'Please enter your\nMobile Number',
        mobileNumberPlaceholder: '3240152180',
        skip: 'Skip',
        skipAll: 'Skip All',
        next: 'Next',
        asthmaTitle: 'Do you have a history of\nAsthma?',
        yes: 'Yes',
        no: 'No',
        settingUpAccount: 'Setting up your account...',
        pleaseSelectLocation: 'Please select a location first',
        preparingNotifications: 'Still preparing notification settings. Please wait a moment and try again.',
        notificationTokenError: 'Unable to generate notification token. Please try again.',
        registrationError: 'Failed to complete registration. Please try again.',
        invalidMobileNumber: 'Please enter a valid Pakistani mobile number',
        invalidMobileNumberFormat: 'Number should be exactly 10 digits (like 3XXXXXXXXX)',

        // Update screen
        updateRequired: 'Update Required',
        currentVersion: 'Current Version',
        latestVersion: 'Latest Version',
        updateMessage: 'A new version of the app is available. Please update to continue using the app with the latest features and bug fixes.',
        downloadUpdate: 'Download Update',
        copyDownloadLink: 'Copy Download Link',
        checkAgain: 'Check Again',
        updateNotice: '⚠️ This update is required to continue using the app. New features and bug fixes are included.',
        linkCopiedTitle: 'Link Copied',
        linkCopiedMessage: 'The download link has been copied to your clipboard. You can now paste it in your browser.',
        downloadUrlNotAvailable: 'Download URL not available',
        unableToOpenLink: 'Unable to Open Link',
        unableToOpenLinkMessage: 'Please copy the download link and open it in your browser manually.',
        failedToCopyLink: 'Failed to copy link to clipboard',
        copySuccess: 'Copied to clipboard! ✓',
        error: 'Error',
        ok: 'OK',

        // AQI descriptions
        good: 'Good',
        satisfactory: 'Satisfactory',
        moderate: 'Moderate',
        unhealthyForSensitive: 'Unhealthy for Sensitive Group',
        unhealthy: 'Unhealthy',
        veryUnhealthy: 'Very Unhealthy',
        hazardous: 'Hazardous',

        // Error messages
        pleaseRetryLater: 'Please try again later',
        failedToLoadAirQuality: 'Failed to connect to the servers. Please try again later.',
        failedToLoadMap: 'Failed to load Map',
        noDataAvailable: 'No data available',
        failedToLoadHistoricalData: 'Failed to load historical air quality data. Please try again later.',
        failedToLoadSummaryData: 'Failed to load summary of air quality data. Please try again later.',
        noHistoricalDataAvailable: 'No historical data available',
        noForecastAvailable: 'No forecast data available',
        failedToLoadForecast: 'Failed to load forecast data. Please try again later.',

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
        today: 'Today',
        yesterday: 'Yesterday',

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

        // Learn More screen
        learnMore: 'Learn More',
        whatIsAirPollutionAndPM2_5_title: 'What is Air Pollution & PM2.5?',
        whatIsAirPollutionAndPM2_5_content: 'Air pollution includes harmful gases and tiny particles in the air that can damage physical and mental health, and reduce economic well-being. \n' +
            'A major threat is PM2.5 - tiny particles from vehicles, industries, and burning of waste or fuel that can enter your  lungs and bloodstream.\n',
        whyIsPM25Harmful_title: 'Why is PM 2.5 Harmful?',
        whyIsPM25Harmful_content: 'PM2.5 particles are extremely small — 28x smaller than a human hair. In cities like Lahore, the air often has too much of these particles, especially in the winter. Sometimes they are 7 or 8 times more than what is recommended by the World Health Organization.',
        whyIsPM25Harmful_image_caption: 'Breathing in Lahore = Smoking 13 Cigarettes a Day',
        whyShouldICare_title: 'Why Should I Care?',
        whyShouldICare_content: 'Breathing in PM2.5 particles can make us sick! It is especially harmful for children, the elderly, and people with asthma or heart and lung issues.',
        whatDoesAQIMean_title: 'What Does AQI Mean?',
        whatDoesAQIMean_content: 'Pollution is measured using something called the AQI. The higher the number, the more dangerous the air.\n' +
            "Here's what the numbers mean and what you should do to stay safe.\n",
        whatCanIDo: 'What Can I Do?',
        contentComingSoon: 'Content coming soon...',
        protectiveMeasuresTitle: 'Protective Measures:',
        wearMask: 'Wear a good-quality mask, like N95, when going out (note, surgical masks do not filter out PM2.5 particles).',
        stayIndoors: 'Stay indoors or limit time outdoors on high pollution days.',
        avoidBurning: 'Avoid burning trash or leaves.',
        avoidTraffic: 'Avoid areas with heavy traffic.',

        // Health effects of PM2.5
        effect_breathing: 'Make it hard to breathe',
        effect_heart: 'Hurt your heart',
        effect_brain: 'Slow down children\'s brain growth',
        effect_baby: 'Result in low birth weight in newborns',
        effect_lifespan: 'Shorten life',
        effect_work: 'Make work harder and tiring',

        // AQI statements
        aqi_good_statement: 'None',
        aqi_satisfactory_statement: 'Sensitive groups: No special precautions needed.',
        aqi_moderate_statement: 'Sensitive groups: Limit prolonged outdoor activity.',
        aqi_unhealthy_sensitive_statement: 'Sensitive groups: Avoid strenuous activity; limit time outdoors.',
        aqi_unhealthy_statement: 'All: Limit time outdoors. Sensitive individuals should avoid exertion.',
        aqi_very_unhealthy_statement: 'Avoid all outdoor activities. Stay indoors with air filters if available.',
        aqi_hazardous_statement: 'Restrict indoors. Take emergency precautions, especially for children & elderly.',

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
        tomorrowPrediction: 'کل کی پیشن گوئی',
        tomorrowSame: 'کل اسی طرح کی ہوا کا معیار',
        tomorrowBetter: 'بہتر ہونے کا امکان ہے۔',
        tomorrowWorse: 'خراب ہونے کا امکان',
        // Home screen
        airQualityIndex: 'ہوا کا معیار انڈیکس',
        viewDetailedReport: 'تفصیلی رپورٹ دیکھیں',
        settings: 'ترتیبات',
        selectLocation: 'مقام منتخب کریں',
        lastUpdated: 'آخری بروزرسانی',
        outdatedDataWarning: 'سرورز سے رابطہ کرنے میں مسئلہ تھا، اس لیے یہ ڈیٹا پرانا ہو سکتا ہے',

        // Settings screen
        locationForAlerts: 'مقام جو اطلاعات حاصل کرے گی',
        receiveAlertsWhenAqiAbove: 'اطلاعات حاصل کریں جب اے کیو آئی بالا ہو',
        language: 'زبان',
        userIdNotFound: 'یوزر آئڈ نہیں ملا ہے۔ براہ کرم اپ اپ چلائیں۔',
        locationUpdateSuccess: 'مقام موفق طور پر اپڈیٹ شدہ',
        locationUpdateError: 'مقام اپڈیٹ کرنے میں ناکام',
        thresholdUpdateSuccess: 'اطلاع آپڈیٹ موفق طور پر کامیاب',
        thresholdUpdateError: 'اطلاع آپڈیٹ کرنے میں ناکام',
        languageUpdateSuccess: 'زبان موفق طور پر اپڈیٹ شدہ',
        languageUpdateError: 'زبان اپڈیٹ کرنے میں ناکام',
        selectAlertThreshold: 'اطلاع آپڈیٹ منتخب کریں',

        // Registration screen
        selectAreaTitle: 'آپ کس علاقے کے لیے اے کیو آئی الرٹس حاصل کرنا چاہیں گے؟',
        selectArea: 'علاقہ منتخب کریں',
        mobileNumberTitle: 'براہ کرم اپنا\nموبائل نمبر درج کریں',
        mobileNumberPlaceholder: '3240152180',
        skip: 'چھوڑیں',
        skipAll: 'سب چھوڑیں',
        next: 'آگے',
        asthmaTitle: 'کیا آپ کو دمہ کی تاریخ ہے؟',
        yes: 'جی ہاں',
        no: 'نہیں',
        settingUpAccount: 'آپ کا اکاؤنٹ سیٹ اپ کر رہے ہیں...',
        pleaseSelectLocation: 'براہ کرم پہلے ایک مقام منتخب کریں',
        preparingNotifications: 'ابھی تک اطلاعات کی ترتیبات تیار کر رہے ہیں۔ براہ کرم ایک لمحہ انتظار کریں اور دوبارہ کوشش کریں۔',
        notificationTokenError: 'اطلاع ٹوکن تیار کرنے میں ناکام۔ دوبارہ کوشش کریں۔',
        registrationError: 'رجسٹریشن مکمل کرنے میں ناکام۔ دوبارہ کوشش کریں۔',
        invalidMobileNumber: 'براہ کرم درست پاکستانی موبائل نمبر درج کریں',
        invalidMobileNumberFormat: 'نمبر بالکل 10 ہندسوں کا ہونا چاہیے (جیسے 3XXXXXXXXX)',

        // Update screen
        updateRequired: 'اپ ڈیٹ ضروری ہے',
        currentVersion: 'موجودہ ورژن',
        latestVersion: 'تازہ ترین ورژن',
        updateMessage: 'ایپ کا نیا ورژن دستیاب ہے۔ براہ کرم نئے فیچرز اور بگ فکسز کے ساتھ ایپ استعمال کرنے کے لیے اپ ڈیٹ کریں۔',
        downloadUpdate: 'اپ ڈیٹ ڈاؤن لوڈ کریں',
        copyDownloadLink: 'ڈاؤن لوڈ لنک کاپی کریں',
        checkAgain: 'دوبارہ چیک کریں',
        updateNotice: '⚠️ اس ایپ کو استعمال کرنے کے لیے اپ ڈیٹ ضروری ہے۔ نئے فیچرز اور بگ فکسز شامل ہیں۔',
        linkCopiedTitle: 'لنک کاپی ہو گیا',
        linkCopiedMessage: 'ڈاؤن لوڈ لنک آپ کے کلپ بورڈ پر کاپی ہو گیا ہے۔ اب آپ اسے اپنے براؤزر میں پیسٹ کر سکتے ہیں۔',
        downloadUrlNotAvailable: 'ڈاؤن لوڈ لنک دستیاب نہیں',
        unableToOpenLink: 'لنک نہیں کھل سکا',
        unableToOpenLinkMessage: 'براہ کرم ڈاؤن لوڈ لنک کو کاپی کریں اور اپنے براؤزر میں دستی طور پر کھولیں۔',
        failedToCopyLink: 'لنک کلپ بورڈ پر کاپی نہیں ہو سکا',
        copySuccess: 'کلپ بورڈ پر کاپی ہو گیا! ✓',
        error: 'خرابی',
        ok: 'اوکے',

        // AQI descriptions
        good: 'اچھا',
        satisfactory: 'اطمینان بخش',
        moderate: 'معتدل',
        unhealthyForSensitive: 'حساس گروپ کے لیے غیر صحت مند',
        unhealthy: 'غیر صحت مند',
        veryUnhealthy: 'بہت غیر صحت مند',
        hazardous: 'خطرناک',

        // Error messages
        pleaseRetryLater: 'براہ کرم بعد میں دوبارہ کوشش کریں',
        failedToLoadAirQuality: 'سرورز سے منسلک ہونے میں ناکام۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',
        failedToLoadMap: 'نقشہ لوڈ کرنے میں ناکام',
        noDataAvailable: 'کوئی ڈیٹا دستیاب نہیں',
        failedToLoadHistoricalData: 'ہوا کے معیار کا تاریخی ڈیٹا لوڈ کرنے میں ناکام۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',
        failedToLoadSummaryData: 'ہوا کے معیار کے ڈیٹا کا خلاصہ لوڈ کرنے میں ناکام۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',
        noHistoricalDataAvailable: 'کوئی تاریخی ڈیٹا دستیاب نہیں ہے',
        noForecastAvailable: 'کوئی فورکاسٹ دستیاب نہیں ہے',
        failedToLoadForecast: 'فورکاسٹ کے ڈیٹا لوڈ کرنے میں ناکام۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',

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
        today: 'آج',
        yesterday: 'گذشتہ دن',

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

        // Learn More screen
        learnMore: 'مزید سیکھیں',
        whatIsAirPollutionAndPM2_5_title: 'فضائی آلودگی اور PM2.5 کیا ہے؟',
        whatIsAirPollutionAndPM2_5_content: 'فضائی آلودگی میں نقصان دہ گیسیں اور ہوا میں موجود چھوٹے ذرات شامل ہیں جو جسمانی اور ذہنی صحت کو نقصان پہنچا سکتے ہیں اور معاشی بہبود کو کم کر سکتے ہیں۔ \n' +
            'ایک بڑا خطرہ PM2.5 ہے - گاڑیوں، صنعتوں، اور فضلہ یا ایندھن کو جلانے کے چھوٹے ذرات جو آپ کے پھیپھڑوں اور خون میں داخل ہو سکتے ہیں۔',
        whyIsPM25Harmful_title: 'پی ایم 2.5 خطرناک کیوں ہے؟',
        whyIsPM25Harmful_content: 'PM2.5 کے ذرات انتہائی چھوٹے ہوتے ہیں — ایک انسانی بال سے 28 گنا چھوٹے۔ لاہور جیسے شہروں میں، ہوا میں اکثر یہ ذرات بہت زیادہ ہوتے ہیں، خاص طور پر سردیوں میں۔ بعض اوقات یہ عالمی ادارہ صحت کے تجویز کردہ سے 7 یا 8 گنا زیادہ ہوتے ہیں۔',
        whyIsPM25Harmful_image_caption: 'لاہور میں سانس لینا = دن میں 13 سگریٹ پینا',
        whyShouldICare_title: 'مجھے اس فکر کیوں کرنی چاہیے؟',
        whyShouldICare_content: 'پی ایم 2.5 ذرات میں سانس لینا ہمیں بیمار کر سکتا ہے! یہ خاص طور پر بچوں، بوڑھوں، اور دمہ یا دل اور پھیپھڑوں کے مسائل والے لوگوں کے لیے نقصان دہ ہے۔',
        whatDoesAQIMean_title: 'آے کیو آی کا مطلب ہے؟',
        whatDoesAQIMean_content: 'آلودگی کو ناپنے کے لیے اے کیو آئی استعمال کیا جاتا ہے۔ جتنا زیادہ نمبر ہو، ہوا اتنی ہی خطرناک ہو۔\nیہاں نمبروں کا مطلب ہے اور آپ کو محفوظ رہنے کے لیے کیا کرنا چاہیے۔',
        whatCanIDo: 'میں کیا کر سکتا/سکتی ہوں؟',
        contentComingSoon: 'مواد جلد آ رہا ہے...',
        protectiveMeasuresTitle: 'حفاظتی اقدامات:',
        wearMask: 'باہر جاتے وقت اچھی کوالٹی کا ماسک پہنیں، جیسے N95 (نوٹ کریں کہ سرجیکل ماسک PM2.5 ذرات کو فلٹر نہیں کرتے)۔',
        stayIndoors: 'زیادہ آلودگی والے دنوں میں گھر کے اندر رہیں یا باہر کا وقت محدود کریں۔',
        avoidBurning: 'کچرا یا پتے جلانے سے گریز کریں۔',
        avoidTraffic: 'بھاری ٹریفک والے علاقوں سے گریز کریں۔',

        // Health effects of PM2.5
        effect_breathing: 'سانس لینا مشکل بناتا ہے',
        effect_heart: 'آپ کے دل کو نقصان پہنچاتا ہے',
        effect_brain: 'بچوں کے دماغی نشوونما کو سست کرتا ہے',
        effect_baby: 'نوزائیدہ بچوں میں کم وزن کا باعث بنتا ہے',
        effect_lifespan: 'زندگی کو مختصر کرتا ہے',
        effect_work: 'کام کو زیادہ مشکل اور تھکا دینے والا بناتا ہے',

        // AQI statements
        aqi_good_statement: 'کوئی نہیں۔',
        aqi_satisfactory_statement: 'حساس گروپ: کسی خاص احتیاط کی ضرورت نہیں۔',
        aqi_moderate_statement: 'حساس گروپ: طویل بیرونی سرگرمیوں کو محدود کریں۔',
        aqi_unhealthy_sensitive_statement: 'حساس گروپس: سخت سرگرمی سے گریز کریں؛ باہر وقت محدود کریں.',
        aqi_unhealthy_statement: 'تمام: باہر وقت محدود کریں۔ حساس افراد کو مشقت سے گریز کرنا چاہیے۔',
        aqi_very_unhealthy_statement: 'تمام بیرونی سرگرمیوں سے گریز کریں۔ اگر دستیاب ہو تو ایئر فلٹرز کے ساتھ گھر کے اندر رہیں۔',
        aqi_hazardous_statement: 'گھر کے اندر تک محدود رکھیں۔ ہنگامی احتیاطی تدابیر اختیار کریں، خاص طور پر بچوں اور بوڑھوں کے لیے۔',

        // Digits - Urdu/Eastern Arabic numerals
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
