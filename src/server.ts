// Load correct .env file based on NODE_ENV
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFilePath = path.resolve(process.cwd(), `.env.${NODE_ENV}`);

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
  console.log(`Loaded environment from .env.${NODE_ENV}`);
} else {
  dotenv.config();
  console.warn(`.env.${NODE_ENV} not found. Using fallback .env`);
}

import express, { Express } from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import { seedAdmin } from './config/seed';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import authRoutes from './routes/auth';

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for correct IP detection
app.set('trust proxy', true);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Form Builder API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Seed admin user on startup
    await seedAdmin();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Do not start the HTTP server during tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
