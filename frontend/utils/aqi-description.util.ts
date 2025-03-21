import { getTranslation } from './translations';
import { Language } from './translations';

export const getAqiDescription = (aqi: number, language: Language = 'Eng'): { level: string; message: string } => {
  if (aqi <= 50) {
    return {
      level: getTranslation('good', language),
      message: language === 'Eng' 
        ? 'Air quality is good, and air pollution poses little or no risk.'
        : 'ہوا کا معیار اچھا ہے، اور ہوا کی آلودگی کم یا کوئی خطرہ نہیں ہے۔'
    };
  }
  if (aqi <= 100) {
    return {
      level: getTranslation('satisfactory', language),
      message: language === 'Eng'
        ? 'Air quality is satisfactory, and air pollution poses little or no risk.'
        : 'ہوا کا معیار تسلی بخش ہے، اور ہوا کی آلودگی کم یا کوئی خطرہ نہیں ہے۔'
    };
  }
  if (aqi <= 150) {
    return {
      level: getTranslation('moderate', language),
      message: language === 'Eng'
        ? 'Air quality is acceptable. However, there may be a risk for some people.'
        : 'ہوا کا معیار قابل قبول ہے۔ تاہم، کچھ لوگوں کے لیے خطرہ ہو سکتا ہے۔'
    };
  }
  if (aqi <= 200) {
    return {
      level: getTranslation('unhealthyForSensitive', language),
      message: language === 'Eng'
        ? 'Members of sensitive groups may experience health effects.'
        : 'حساس گروپوں کے ممبران صحت کے اثرات کا تجربہ کر سکتے ہیں۔'
    };
  }
  if (aqi <= 300) {
    return {
      level: getTranslation('unhealthy', language),
      message: language === 'Eng'
        ? 'Everyone may begin to experience health effects.'
        : 'ہر کوئی صحت کے اثرات کا تجربہ کرنا شروع کر سکتا ہے۔'
    };
  }
  if (aqi <= 400) {
    return {
      level: getTranslation('veryUnhealthy', language),
      message: language === 'Eng'
        ? 'Health warnings of emergency conditions. The entire population is likely to be affected.'
        : 'ہنگامی حالات کی صحت کی تنبیہات۔ پوری آبادی متاثر ہونے کا امکان ہے۔'
    };
  }
  return {
    level: getTranslation('hazardous', language),
    message: language === 'Eng'
      ? 'Health alert: everyone may experience more serious health effects.'
      : 'صحت کی تنبیہ: ہر کوئی زیادہ سنگین صحت کے اثرات کا تجربہ کر سکتا ہے۔'
  };
}; 