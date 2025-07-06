// app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('🚀 Starting ELO Learning Server...');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'ELO Learning API is running successfully!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET / - Health check',
      'GET /api/status - Status check',
      'POST /api/math/validate - Math validation',
      'POST /api/game/calculate-xp - Calculate single player XP',
      'GET /api/topics - Get all topics',
      'GET /api/users - Get all users',
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
    ],
  });
});

// Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Try to load routes dynamically
const loadRoute = (
  routePath: string,
  mountPath: string,
  routeName: string,
): boolean => {
  try {
    const routeModule = require(routePath);
    const route = routeModule.default || routeModule;
    app.use(mountPath, route);
    console.log(`✅ ${routeName} routes loaded at ${mountPath}`);
    return true;
  } catch (error) {
    console.log(
      `⚠️  ${routeName} routes not found: ${(error as Error).message}`,
    );
    return false;
  }
};

// Load routes
const initializeRoutes = () => {
  console.log('🔄 Loading routes...');

  // Try to load existing routes
  loadRoute(
    './application/elo-learning/routes/topics',
    '/api/topics',
    'Topics',
  );
  loadRoute('./application/elo-learning/routes/users', '/api/users', 'Users');
  loadRoute('./application/elo-learning/routes/auth', '/api/auth', 'Auth');
  loadRoute(
    './application/elo-learning/routes/questions',
    '/api/questions',
    'Questions',
  );
  loadRoute('./application/elo-learning/routes/games', '/api/game', 'Games');
  loadRoute(
    './application/elo-learning/routes/mathValidation',
    '/api/math',
    'Math Validation',
  );

  // Create fallback endpoints
  createFallbackRoutes();
};

const createFallbackRoutes = () => {
  console.log('🔄 Creating fallback routes...');

  // Fallback auth routes
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    res.json({
      message: 'Login endpoint (fallback)',
      token: 'fake-jwt-token',
      user: { email, id: '123' },
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ error: 'Email, password, and username required' });
    }
    res.json({
      message: 'Registration endpoint (fallback)',
      user: { email, username, id: '123' },
    });
  });

  // Fallback math validation
  app.post('/api/math/validate', (req: Request, res: Response) => {
    const { studentAnswer, correctAnswer } = req.body;
    if (!studentAnswer || !correctAnswer) {
      return res
        .status(400)
        .json({ error: 'studentAnswer and correctAnswer required' });
    }

    const isValid =
      studentAnswer.toString().trim() === correctAnswer.toString().trim();
    res.json({
      isValid,
      studentAnswer,
      correctAnswer,
      method: 'fallback',
      timestamp: new Date().toISOString(),
    });
  });

  // Fallback XP calculation
  app.post('/api/game/calculate-xp', (req: Request, res: Response) => {
    const { CA, XPGain, actualTimeSeconds = 0, currentLevel = 1 } = req.body;

    if (typeof CA !== 'number' || typeof XPGain !== 'number') {
      return res.status(400).json({ error: 'CA and XPGain must be numbers' });
    }

    // Simple XP calculation
    const timeBonus = Math.max(0, 30 - actualTimeSeconds) / 30;
    const levelMultiplier = 1 + currentLevel * 0.1;
    const calculatedXP = CA * XPGain * (1 + timeBonus) * levelMultiplier;

    res.json({
      calculatedXP: Number(calculatedXP.toFixed(2)),
      parameters: { CA, XPGain, actualTimeSeconds, currentLevel },
      method: 'fallback',
      timestamp: new Date().toISOString(),
    });
  });

  // Fallback topics
  app.get('/api/topics', (req: Request, res: Response) => {
    res.json({
      topics: [
        { id: '1', name: 'Algebra', description: 'Basic algebra topics' },
        { id: '2', name: 'Calculus', description: 'Calculus fundamentals' },
        { id: '3', name: 'Geometry', description: 'Geometric concepts' },
      ],
      method: 'fallback',
    });
  });

  // Fallback users
  app.get('/api/users', (req: Request, res: Response) => {
    res.json({
      users: [
        {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          level: 1,
          xp: 100,
        },
      ],
      method: 'fallback',
    });
  });

  // Fallback questions
  app.get('/api/questions', (req: Request, res: Response) => {
    res.json({
      questions: [
        {
          id: '1',
          question_text: 'What is 2 + 2?',
          correct_answer: '4',
          difficulty: 1,
          topic_id: '1',
        },
      ],
      method: 'fallback',
    });
  });

  console.log('✅ Fallback routes created');
};

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/status',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/math/validate',
      'POST /api/game/calculate-xp',
      'GET /api/topics',
      'GET /api/users',
      'GET /api/questions',
    ],
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Global Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Initialize routes and start server
console.log('🚀 Initializing application...');
initializeRoutes();

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📋 Test the endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/math/validate`);
  console.log(`   POST http://localhost:${PORT}/api/game/calculate-xp`);
  console.log(`   GET  http://localhost:${PORT}/api/topics`);
});

export = app;
