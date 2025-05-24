module.exports = {
  apps: [
    {
      name: "backend",
      script: "./dist/index.js",
      instances: "max", // Use maximum number of CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
      },
      watch: false,
      max_memory_restart: "1G",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
    {
      name: "weather-forecast-cron",
      script: "./dist/scripts/weatherForecastCron.js",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 10 * * *", // ✅ new (10AM UTC = 3PM PKT)
      watch: false,
      autorestart: false,
      env: {
        NODE_ENV: "production",
      },
      error_file: "logs/cron-err.log",
      out_file: "logs/cron-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
    {
      name: "air-quality-forecast-cron",
      script: "./dist/scripts/airQualityForecastCron.js",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 11 * * *", // ✅ Runs at 11AM UTC (1 hour after weather forecast)
      watch: false,
      autorestart: false,
      env: {
        NODE_ENV: "production",
      },
      error_file: "logs/air-quality-cron-err.log",
      out_file: "logs/air-quality-cron-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    }
  ]
}; 