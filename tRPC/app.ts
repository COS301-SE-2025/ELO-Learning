// app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

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
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
      'POST /api/game/singleplayer - Single player game',
      'POST /api/game/multiplayer - Multiplayer game',
      'POST /api/math/validate-answer - Math validation',
      'POST /api/math/quick-validate - Quick math validation',
      'GET /api/questions - Get questions',
      'GET /api/questions/random - Get random questions',
      'GET /api/topics - Get all topics',
      'GET /api/users - Get all users',
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

// Dynamic route loading function
const loadRoute = (routePaths: string[], mountPath: string, routeName: string): boolean => {
  for (const routePath of routePaths) {
    try {
      const fullPath = path.resolve(__dirname, routePath);
      console.log(`🔍 Trying to load ${routeName} from: ${fullPath}`);
      
      // Clear require cache
      delete require.cache[require.resolve(fullPath)];
      
      const routeModule = require(fullPath);
      const route = routeModule.default || routeModule;
      
      if (typeof route === 'function') {
        app.use(mountPath, route);
        console.log(`✅ ${routeName} routes loaded at ${mountPath} from ${routePath}`);
        return true;
      } else {
        console.log(`⚠️  ${routeName} export is not a valid router function`);
      }
    } catch (error) {
      console.log(`⚠️  ${routeName} not found at ${routePath}: ${(error as Error).message}`);
    }
  }
  return false;
};

// Load routes with multiple possible paths
const initializeRoutes = () => {
  console.log('🔄 Loading routes...');
  console.log(`📁 Current directory: ${__dirname}`);

  const routeConfigs = [
    {
      name: 'Auth',
      paths: [
        './application/elo-learning/routes/auth',
        './routes/auth',
        '../routes/auth', 
        './auth',
        '../auth',
        '../../routes/auth',
        './backend/routes/auth'
      ],
      mount: '/api/auth'
    },
    {
      name: 'Game', 
      paths: [
        './application/elo-learning/routes/games',
        './routes/game',
        '../routes/game',
        './game', 
        '../game',
        '../../routes/game',
        './backend/routes/game'
      ],
      mount: '/api/game'
    },
    {
      name: 'Math',
      paths: [
        './application/elo-learning/routes/mathValidation',
        './routes/math',
        '../routes/math',
        './math',
        '../math', 
        '../../routes/math',
        './backend/routes/math'
      ],
      mount: '/api/math'
    },
    {
      name: 'Questions',
      paths: [
        './application/elo-learning/routes/question',
        './routes/question',
        '../routes/question',
        './question',
        '../question',
        '../../routes/question', 
        './backend/routes/question'
      ],
      mount: '/api/questions'
    },
    {
      name: 'Topics',
      paths: [
        './application/elo-learning/routes/topics',
        './routes/topics',
        '../routes/topics',
        './topics',
        '../topics',
        '../../routes/topics',
        './backend/routes/topics'
      ],
      mount: '/api/topics'
    },
    {
      name: 'Users',
      paths: [
        './application/elo-learning/routes/users',
        './routes/users',
        '../routes/users', 
        './users',
        '../users',
        '../../routes/users',
        './backend/routes/users'
      ],
      mount: '/api/users'
    }
  ];

  let routesLoaded = 0;
  for (const config of routeConfigs) {
    if (loadRoute(config.paths, config.mount, config.name)) {
      routesLoaded++;
    }
  }

  console.log(`📊 Successfully loaded ${routesLoaded}/${routeConfigs.length} route modules`);
  
  if (routesLoaded === 0) {
    console.log('⚠️  No routes found! Creating fallback endpoints...');
    createFallbackRoutes();
  }
};

const createFallbackRoutes = () => {
  console.log('🔄 Creating fallback routes...');

  // Fallback auth routes (only if not already mounted)
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
      return res.status(400).json({ error: 'Email, password, and username required' });
    }
    res.json({
      message: 'Registration endpoint (fallback)',
      user: { email, username, id: '123' },
    });
  });

  // Fallback game routes
  app.post('/api/game/singleplayer', (req: Request, res: Response) => {
    res.json({
      message: 'Single player endpoint (fallback)',
      xpEarned: 10,
      leveledUp: false,
    });
  });

  app.post('/api/game/multiplayer', (req: Request, res: Response) => {
    res.json({
      message: 'Multiplayer endpoint (fallback)',
      players: [],
    });
  });

  // Fallback math routes
  app.post('/api/math/validate-answer', (req: Request, res: Response) => {
    const { studentAnswer, correctAnswer } = req.body;
    const isCorrect = studentAnswer?.toString().trim() === correctAnswer?.toString().trim();
    res.json({
      isCorrect,
      studentAnswer,
      correctAnswer,
      message: isCorrect ? 'Correct!' : 'Incorrect',
    });
  });

  // Fallback questions routes
  app.get('/api/questions', (req: Request, res: Response) => {
    res.json({
      questions: [
        {
          Q_id: '1',
          topic: 'Algebra',
          difficulty: 'Easy',
          level: 1,
          questionText: 'What is 2 + 2?',
          xpGain: 10,
          type: 'multiple-choice'
        }
      ],
      method: 'fallback',
    });
  });

  app.get('/api/questions/random', (req: Request, res: Response) => {
    res.json({
      questions: [
        {
          Q_id: '1',
          topic: 'Algebra', 
          difficulty: 'Easy',
          level: 1,
          questionText: 'What is 2 + 2?',
          xpGain: 10,
          type: 'multiple-choice',
          answers: [
            { id: '1', answer_text: '3', isCorrect: false },
            { id: '2', answer_text: '4', isCorrect: true },
            { id: '3', answer_text: '5', isCorrect: false }
          ]
        }
      ],
      method: 'fallback',
    });
  });

  // Fallback topics routes
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

  // Fallback users routes
  app.get('/api/users', (req: Request, res: Response) => {
    res.json([
      {
        id: '1',
        name: 'Test',
        surname: 'User',
        username: 'testuser',
        email: 'test@example.com',
        currentLevel: 1,
        joinDate: new Date().toISOString(),
        xp: 100,
      },
    ]);
  });

  console.log('✅ Fallback routes created');
};

// Initialize routes and start server
console.log('🚀 Initializing application...');
initializeRoutes();

// 404 handler (MUST come after all routes)
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
      'POST /api/game/singleplayer',
      'POST /api/game/multiplayer',
      'POST /api/math/validate-answer',
      'GET /api/questions',
      'GET /api/topics',
      'GET /api/users',
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

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/game/singleplayer`);
  console.log(`   POST http://localhost:${PORT}/api/game/multiplayer`);
  console.log(`   POST http://localhost:${PORT}/api/math/validate-answer`);
  console.log(`   GET  http://localhost:${PORT}/api/questions`);
  console.log(`   GET  http://localhost:${PORT}/api/topics`);
  console.log(`   GET  http://localhost:${PORT}/api/users`);
});

export = app;