/**
 * Standard action types for user tracking
 * Used in trackActivity function and in tracking components
 */
export const ACTION_TYPES = {
  BUTTON_CLICK: 'button_click',
  SCREEN_VIEW: 'screen_view',
  USER_INPUT: 'user_input',
  NAVIGATION: 'navigation',
  SELECTION: 'selection',
  TOGGLE: 'toggle',
  APP_STATE: 'app_state_change',
  APP_EXIT: 'app_exit',
  APP_ENTRY: 'app_entry',
  BACK_BUTTON: 'back_button_press',
};

/**
 * Standard names for UI elements
 * Used as keys in tracking functions to ensure consistency
 */
export const ELEMENT_NAMES = {
  // Navigation buttons
  NAV_HOME: 'nav_home',
  NAV_BACK: 'nav_back',
  NAV_SETTINGS: 'nav_settings',
  NAV_PROFILE: 'nav_profile',

  // Common buttons
  BTN_SUBMIT: 'btn_submit',
  BTN_CANCEL: 'btn_cancel',
  BTN_SAVE: 'btn_save',
  BTN_CLOSE: 'btn_close',
  BTN_DELETE: 'btn_delete',
  BTN_EDIT: 'btn_edit',
  BTN_ADD: 'btn_add',
  BTN_REFRESH: 'btn_refresh',

  // Home screen
  BTN_VIEW_DETAILED_REPORT: 'btn_view_detailed_report',
  SEL_LOCATION: 'sel_location',
  BTN_EXPAND_LEGEND: 'btn_expand_legend',
  BTN_FUTURE_PREDICTION: 'btn_future_prediction',

  // Air quality screens
  BTN_VIEW_HISTORY: 'btn_view_history',
  SEL_POLLUTANT: 'sel_pollutant',
  SEL_TIME_RANGE: 'sel_time_range',
  TOG_CHART_DISPLAY: 'tog_chart_display',

  // Map interactions
  MAP_REGION_CHANGE: 'map_drag',
  MAP_PRESS: 'map_press',
  MAP_MARKER_PRESS: 'map_marker_press',

  // Settings
  ALERT_THRESHOLD: 'alert_threshold',
};

/**
 * Standard screen names
 * Used for consistent screen tracking
 */
export const SCREEN_NAMES = {
  HOME: 'HomeScreen',
  DETAILED_REPORT: 'AirQualityDetailedReport',
  HISTORY: 'AirQualityHistory',
  REGISTRATION: 'RegistrationScreen',
  PROFILE: 'ProfileScreen',
  SETTINGS: 'SettingsScreen',
  LOCATION_SELECTION: 'LocationSelectionScreen',
};
