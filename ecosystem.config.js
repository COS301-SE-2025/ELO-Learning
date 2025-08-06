module.exports = {
    apps: [
        {
            name: 'elo-backend',
            script: './backend/src/server.js',
            cwd: process.env.HOME ? `${process.env.HOME}/repositories/elo-learning` : '/var/www/elo-learning',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M', // Lower memory limit for shared hosting
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_file: './logs/backend-combined.log',
            time: true,
            // Additional options for shared hosting
            max_restarts: 5,
            min_uptime: '10s',
            kill_timeout: 5000
        },
        {
            name: 'elo-frontend',
            script: 'npm',
            args: 'start',
            cwd: process.env.HOME ? `${process.env.HOME}/repositories/elo-learning/frontend` : '/var/www/elo-learning/frontend',
            env: {
                NODE_ENV: 'production',
                PORT: 8080
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M', // Lower memory limit for shared hosting
            error_file: './logs/frontend-error.log',
            out_file: './logs/frontend-out.log',
            log_file: './logs/frontend-combined.log',
            time: true,
            // Additional options for shared hosting
            max_restarts: 5,
            min_uptime: '10s',
            kill_timeout: 5000
        }
    ]
}
