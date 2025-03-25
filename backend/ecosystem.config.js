module.exports = {
  apps: [{
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
  }]
}; 