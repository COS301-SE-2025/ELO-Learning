import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Define the environment type for D1 binding
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('*', cors());

// Your routes go here
app.get('/', (c) => {
  return c.text('Hello from Hono on Cloudflare with D1!');
});

// Test database connection
app.get('/db-test', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT 1 as test').first();
    return c.json({ success: true, result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, error: errorMessage }, 500);
  }
});

export default app;
