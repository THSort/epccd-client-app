export const getAqiDescription = (aqi: number): { level: string; message: string } => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      message: 'Air quality is satisfactory, and air pollution poses little or no risk.'
    };
  }
  if (aqi <= 100) {
    return {
      level: 'Moderate',
      message: 'Air quality is acceptable. However, there may be a risk for some people.'
    };
  }
  if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      message: 'Members of sensitive groups may experience health effects.'
    };
  }
  if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      message: 'Everyone may begin to experience health effects.'
    };
  }
  if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      message: 'Health warnings of emergency conditions. The entire population is likely to be affected.'
    };
  }
  return {
    level: 'Hazardous',
    message: 'Health alert: everyone may experience more serious health effects.'
  };
}; 