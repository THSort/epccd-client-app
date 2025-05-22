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

aqms_data_location_day <- aqms_data%>%
  select(-matches("_ppb"))%>% # remove concentration measures and leave AQI b/c redundant and would be almost fully explanatory
  select(-matches("_ppm"))%>% # remove concentration measures and leave AQI b/c redundant and would be almost fully explanatory
  select(-matches("_ug_m3"))%>% # remove concentration measures and leave AQI b/c redundant and would be almost fully explanatory
  subset(select = -c(time, report_date_time, report_date_time_ok, report_date_time_pieces, report_date_time_remainder, wind_direction))%>%
  group_by(location, date)%>%
  arrange(date, location)%>%
  summarise(
    across(everything(), mean, na.rm = TRUE, .names = "{.col}_loc_day"),  # mean of all variables
    count = n(),                               # number of rows per group
    .groups = "drop"                           # ungroup the result
  )%>%
  arrange(location, date) %>%
  group_by(location) %>%
  mutate(
    # Create lags 1 to 3 for all numeric variables
    across(
      .cols = where(is.numeric),
      .fns = list(
        lag1 = ~lag(.x, 1),
        lag2 = ~lag(.x, 2),
        lag3 = ~lag(.x, 3),
        lag4 = ~lag(.x, 4),
        lag5 = ~lag(.x, 5),
        lag6 = ~lag(.x, 6),
        lag7 = ~lag(.x, 7)
      ),
      .names = "{.col}_{.fn}"   # e.g. price_lag1, price_lag2, etc.
    )
  ) %>%
  ungroup()%>%
  arrange(date, location)

# 5 monitors for most of the time, 24 obs per day
# 21 monitors with varying frequencies (some up to 100's per day) from 2025-03-29
## NOTE: Only the locations 1-5 are from Lahore. Others are from outside Lahore.

## daily measure (mean across location)
## Restrict to locations 1-5
aqms_data_day <- aqms_data%>%
  subset(location <= 5)%>%
  select(-matches("_ppb"))%>% # remove concentration measures and leave AQI b/c redundant and would be almost fully explanatory
  select(-matches("_ppm"))%>% # remove concentration measures and leave AQI b/c redundant and would be almost fully explanatory
  select(-matches("_ug_m3"))%>% # remove concentration measures and leave AQI b/c redundant and would be almost fully explanatory
  subset(select = -c(location, time, report_date_time, report_date_time_ok, report_date_time_pieces, report_date_time_remainder, wind_direction))%>%
  group_by(date)%>%
  arrange(date)%>%
  summarise(
    across(everything(), mean, na.rm = TRUE, .names = "{.col}_day"),  # mean of all variables
    .groups = "drop"                           # ungroup the result
  )%>%
  ungroup()%>%
  arrange(date) %>%
  mutate(
    # Create lags 1 to 3 for all numeric variables
    across(
      .cols = where(is.numeric),
      .fns = list(
        lag1 = ~lag(.x, 1),
        lag2 = ~lag(.x, 2),
        lag3 = ~lag(.x, 3),
        lag4 = ~lag(.x, 4),
        lag5 = ~lag(.x, 5),
        lag6 = ~lag(.x, 6),
        lag7 = ~lag(.x, 7)
      ),
      .names = "{.col}_{.fn}"   # e.g. price_lag1, price_lag2, etc.
    )
  ) %>%
  ungroup()%>%
  arrange(date)
## analysis df
analysis_df <- subset(aqms_data_location_day, location <= 5)%>%
                left_join(aqms_data_day, by = "date")%>%
                select(any_of(c("date", "location", "PM2_5_AQI_loc_day")), matches("_lag"))%>%
                mutate(location = as.factor(location))

######################################################################################################################
## LASSO
######################################################################################################################s
analysis_df <- analysis_df %>%
  drop_na(PM2_5_AQI_loc_day)%>%   # glmnet can't handle NAs
  drop_na(where(is.numeric))  # drop rows with NA in predictors

X <- analysis_df %>%
  select(-location, -date, -PM2_5_AQI_loc_day) %>%
  as.matrix()

y <- analysis_df$PM2_5_AQI_loc_day


set.seed(seed) # for reproducibility

#### LASSO

lasso_model <- cv.glmnet(X, y, alpha = 1)

#### Next-day prediction data

# Find latest date in data
max_date <- max(analysis_df$date)

# Extract last row per location
newdata <- analysis_df %>%
  filter(date == max_date) %>%
  mutate(date = date + days(1))     # simulate next day

# Build new predictor matrix
X_new <- newdata %>%
  select(-location, -date, -PM2_5_AQI_loc_day) %>%
  as.matrix()

# Generate prediction
newdata$forecast_PM2_5_AQI_loc_day <- as.vector(predict(lasso_model, newx = X_new, s = "lambda.min"))

##### Final output
forecast_df <- newdata %>%
  select(location, date, forecast_PM2_5_AQI_loc_day)

# Write to output
write_csv(forecast_df, output_csv_path)