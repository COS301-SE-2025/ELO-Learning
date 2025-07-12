import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// Your routes go here
app.get('/', (c) => {
  return c.text('Hello from Hono on Cloudflare!');
});

export default app;
