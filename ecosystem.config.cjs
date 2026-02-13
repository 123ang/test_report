module.exports = {
  apps: [
    {
      name: 'test-report-backend',
      cwd: './backend',
      script: 'src/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4014
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 4014
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'test-report-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev -- --port 3014 --host 0.0.0.0',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    }
  ]
};
