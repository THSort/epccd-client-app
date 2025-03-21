export const getAqiColor = (aqi: number) => {
    if (aqi <= 50) {
        return '#4CAF50'; // Good (green)
    }
    if (aqi <= 100) {
        return '#8BC34A'; // Satisfactory (light green)
    }
    if (aqi <= 150) {
        return '#FFEB3B'; // Moderate (yellow)
    }
    if (aqi <= 200) {
        return '#FF9800'; // Unhealthy for sensitive groups (orange)
    }
    if (aqi <= 300) {
        return '#F44336'; // Unhealthy (red)
    }
    if (aqi <= 400) {
        return '#9C27B0'; // Very Unhealthy (purple)
    }
    return '#6D4C41'; // Hazardous (brown)
};
