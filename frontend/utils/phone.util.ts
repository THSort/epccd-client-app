/**
 * Utilities for handling Pakistani mobile numbers
 */

/**
 * Validates and formats a Pakistani mobile number
 * Handles various user input formats:
 * - Standard (preferred): 3XXXXXXXXX (10 digits without leading zero)
 * - With leading zero: 03XXXXXXXXX
 * - With country code: 923XXXXXXXXX
 * - With plus and country code: +923XXXXXXXXX
 * 
 * @param mobileNumber The mobile number to validate and format
 * @returns An object with the validation result and formatted number
 */
export const validatePakistaniMobileNumber = (
  mobileNumber: string
): { isValid: boolean; formattedNumber: string | null } => {
  // Remove all non-digit characters
  const digitsOnly = mobileNumber.replace(/\D/g, '');
  
  // If empty, not valid
  if (!digitsOnly) {
    return { isValid: false, formattedNumber: null };
  }

  // Pakistani mobile numbers should start with 3 after country code/leading zero
  // The different patterns we accept:
  
  // 1. Standard 10-digit format without leading zero (ideal format): 3XXXXXXXXX
  if (digitsOnly.length === 10 && digitsOnly.startsWith('3')) {
    return { isValid: true, formattedNumber: digitsOnly };
  }
  
  // 2. With leading zero: 03XXXXXXXXX
  if (digitsOnly.length === 11 && digitsOnly.startsWith('03')) {
    return { isValid: true, formattedNumber: digitsOnly.substring(1) }; // Remove leading zero
  }
  
  // 3. With country code: 923XXXXXXXXX
  if (digitsOnly.length === 12 && digitsOnly.startsWith('923')) {
    return { isValid: true, formattedNumber: digitsOnly.substring(2) }; // Remove 92
  }
  
  // 4. With country code and leading zero: 9203XXXXXXXXX
  if (digitsOnly.length === 13 && digitsOnly.startsWith('9203')) {
    return { isValid: true, formattedNumber: digitsOnly.substring(3) }; // Remove 920
  }
  
  // 5. Special case for multiple leading zeros or country codes
  if (digitsOnly.length > 13) {
    // Try to find a valid Pakistani number pattern within the digits
    // Look for patterns like xxx3xxxxxxxx where the last 10 digits form a valid number
    const lastElevenDigits = digitsOnly.slice(-11);
    if (lastElevenDigits.startsWith('03')) {
      return { isValid: true, formattedNumber: lastElevenDigits.substring(1) }; // Remove leading 0
    }
    
    const lastTenDigits = digitsOnly.slice(-10);
    if (lastTenDigits.startsWith('3')) {
      return { isValid: true, formattedNumber: lastTenDigits };
    }
    
    const lastTwelveDigits = digitsOnly.slice(-12);
    if (lastTwelveDigits.startsWith('923')) {
      return { isValid: true, formattedNumber: lastTwelveDigits.substring(2) }; // Remove 92
    }
  }
  
  // Not a valid Pakistani mobile number format
  return { isValid: false, formattedNumber: null };
};

/**
 * Checks if the mobile number has a valid format for UI validation
 * This is used for real-time validation during user input
 * 
 * @param mobileNumber The mobile number to check
 * @returns Whether the format is valid
 */
export const hasValidMobileNumberFormat = (mobileNumber: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = mobileNumber.replace(/\D/g, '');
  
  // Empty is considered valid during typing
  if (!digitsOnly) {
    return true;
  }
  
  // Check common Pakistani mobile number patterns
  // The mobile number is considered valid if it partially matches any of the formats
  
  // Starting with 3 (ideal format)
  if (digitsOnly.startsWith('3')) {
    // Must be exactly 10 digits for a complete number, but during typing we allow less
    return digitsOnly.length <= 10;
  }
  
  // Starting with 03
  if (digitsOnly.startsWith('03')) {
    // Must be exactly 11 digits for a complete number, but during typing we allow less
    return digitsOnly.length <= 11;
  }
  
  // Starting with 92 followed by 3
  if (digitsOnly.startsWith('92') && digitsOnly.length >= 3 && digitsOnly[2] === '3') {
    // Must be exactly 12 digits for a complete number, but during typing we allow less
    return digitsOnly.length <= 12;
  }
  
  // Starting with 92 followed by 03
  if (digitsOnly.startsWith('92') && digitsOnly.length >= 4 && digitsOnly.substring(2, 4) === '03') {
    // Must be exactly 13 digits for a complete number, but during typing we allow less
    return digitsOnly.length <= 13;
  }
  
  // Starting with +92
  if (mobileNumber.startsWith('+92')) {
    const withoutPlus = mobileNumber.substring(1).replace(/\D/g, '');
    
    // Check if it's followed by 3 or 03
    if (withoutPlus.length >= 3 && withoutPlus[2] === '3') {
      return withoutPlus.length <= 12; // +92 3XXXXXXXX
    }
    
    if (withoutPlus.length >= 4 && withoutPlus.substring(2, 4) === '03') {
      return withoutPlus.length <= 13; // +92 03XXXXXXXX
    }
  }
  
  // If it doesn't match any of the patterns, it's invalid
  return false;
}; 