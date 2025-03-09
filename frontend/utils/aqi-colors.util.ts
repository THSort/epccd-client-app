export const getAqiColor = (aqi: number) => {
    if (aqi <= 50) {
        return '#00E400';
    }
    if (aqi <= 100) {
        return '#FFFF00';
    }
    if (aqi <= 150) {
        return '#FF7E00';
    }
    return '#FF0000';
};
