#########################################################################################
# Air quality forecast code (portable version)
#########################################################################################

# Libraries
library(dplyr)
library(xgboost)
library(caret)
library(tree)
library(glmnet)
library(lubridate)
library(reshape2)
library(tidyverse)
library(readr)

# Handle arguments
args <- commandArgs(trailingOnly = TRUE)

if (length(args) < 2) {
  stop("Usage: Rscript forecast_model.R <input_csv_path> <output_csv_path>")
}

input_csv_path <- args[1]
output_csv_path <- args[2]

# Seed and version
seed <- 202500508
set.seed(seed)
date_version <- "202500508"

# Read input
aqms_data <- read_csv(input_csv_path) %>% as.data.frame()

# Continue with your existing transformations...

aqms_data <- aqms_data %>%
  separate_wider_delim(
    report_date_time,
    delim = "T",
    names = c("date", "time"),
    too_few = "debug",
    too_many = "debug"
  )

aqms_data$date <- as.Date(aqms_data$date , "%Y-%m-%d")

aqms_data_location_day <- aqms_data %>%
  select(-matches("_ppb|_ppm|_ug_m3")) %>%
  select(-c(time, report_date_time, report_date_time_ok, report_date_time_pieces, report_date_time_remainder, wind_direction)) %>%
  group_by(location, date) %>%
  arrange(date, location) %>%
  summarise(
    across(everything(), mean, na.rm = TRUE, .names = "{.col}_loc_day"),
    count = n(),
    .groups = "drop"
  ) %>%
  arrange(location, date) %>%
  group_by(location) %>%
  mutate(
    across(
      where(is.numeric),
      list(
        lag1 = ~lag(.x, 1),
        lag2 = ~lag(.x, 2),
        lag3 = ~lag(.x, 3),
        lag4 = ~lag(.x, 4),
        lag5 = ~lag(.x, 5),
        lag6 = ~lag(.x, 6),
        lag7 = ~lag(.x, 7)
      ),
      .names = "{.col}_{.fn}"
    )
  ) %>%
  ungroup() %>%
  arrange(date, location)

aqms_data_day <- aqms_data %>%
  filter(location <= 5) %>%
  select(-matches("_ppb|_ppm|_ug_m3")) %>%
  select(-c(location, time, report_date_time, report_date_time_ok, report_date_time_pieces, report_date_time_remainder, wind_direction)) %>%
  group_by(date) %>%
  arrange(date) %>%
  summarise(
    across(everything(), mean, na.rm = TRUE, .names = "{.col}_day"),
    .groups = "drop"
  ) %>%
  ungroup() %>%
  arrange(date) %>%
  mutate(
    across(
      where(is.numeric),
      list(
        lag1 = ~lag(.x, 1),
        lag2 = ~lag(.x, 2),
        lag3 = ~lag(.x, 3),
        lag4 = ~lag(.x, 4),
        lag5 = ~lag(.x, 5),
        lag6 = ~lag(.x, 6),
        lag7 = ~lag(.x, 7)
      ),
      .names = "{.col}_{.fn}"
    )
  )

analysis_df <- subset(aqms_data_location_day, location <= 5) %>%
  left_join(aqms_data_day, by = "date") %>%
  select(any_of(c("date", "location", "PM2_5_AQI_loc_day")), matches("_lag")) %>%
  mutate(location = as.factor(location))

# LASSO
analysis_df <- analysis_df %>%
  drop_na(PM2_5_AQI_loc_day) %>%
  drop_na(where(is.numeric))

X <- analysis_df %>%
  select(-location, -date, -PM2_5_AQI_loc_day) %>%
  as.matrix()

y <- analysis_df$PM2_5_AQI_loc_day

set.seed(seed)
lasso_model <- cv.glmnet(X, y, alpha = 1)

# Prediction for next day
max_date <- max(analysis_df$date)
newdata <- analysis_df %>%
  filter(date == max_date) %>%
  mutate(date = date + days(1))

X_new <- newdata %>%
  select(-location, -date, -PM2_5_AQI_loc_day) %>%
  as.matrix()

newdata$forecast_PM2_5_AQI_loc_day <- predict(lasso_model, newx = X_new, s = "lambda.min")

forecast_df <- newdata %>%
  select(location, date, forecast_PM2_5_AQI_loc_day)

# Write to output
write_csv(forecast_df, output_csv_path)