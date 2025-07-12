import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const routeConfigs = [
  {
    name: 'Auth',
    path: './application/elo-learning/routes/auth',
    mount: '/api/auth',
  },
  {
    name: 'Game',
    path: './application/elo-learning/routes/games',
    mount: '/api/game',
  },
  {
    name: 'Math',
    path: './application/elo-learning/routes/mathValidation',
    mount: '/api/math',
  },
  {
    name: 'Questions',
    path: './application/elo-learning/routes/question',
    mount: '/api/questions',
  },
  {
    name: 'Topics',
    path: './application/elo-learning/routes/topics',
    mount: '/api/topics',
  },
  {
    name: 'Users',
    path: './application/elo-learning/routes/users',
    mount: '/api/users',
  },
];

// Load each route dynamically
for (const config of routeConfigs) {
  const fullPath = resolve(__dirname, config.path);
  if (existsSync(`${fullPath}.ts`) || existsSync(`${fullPath}.js`)) {
    const routeModule = require(fullPath);
    const router = routeModule.default || routeModule;
    app.use(config.mount, router);
    console.log(`✅ Mounted ${config.name} at ${config.mount}`);
  } else {
    console.warn(`⚠️ Route "${config.name}" not found at ${config.path}`);
  }
}

// Fallback route
app.get('/', (_req, res) => {
  res.send('ELO-Learning API is running.');
});

// Catch-all for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
