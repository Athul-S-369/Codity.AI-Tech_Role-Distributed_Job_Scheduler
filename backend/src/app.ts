import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { AUTHOR_NAME, AUTHOR_REGISTRATION } from '@codity/shared';

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/projects.routes';
import queueRoutes from './routes/queues.routes';
import jobRoutes from './routes/jobs.routes';
import workerRoutes from './routes/workers.routes';
import metricsRoutes from './routes/metrics.routes';
import eventsRoutes from './routes/events.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Author', AUTHOR_NAME);
    res.setHeader('X-Registration-No', AUTHOR_REGISTRATION);
    next();
  });

  if (config.nodeEnv === 'production') {
    const authLimiter = rateLimit({
      windowMs: 60_000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many requests, please try again later.' },
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);

    const apiLimiter = rateLimit({
      windowMs: 60_000,
      max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many requests, please try again later.' },
      skip: (req) => req.path.startsWith('/api/workers'),
    });
    app.use(apiLimiter);
  }

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      author: AUTHOR_NAME,
      registrationNo: AUTHOR_REGISTRATION,
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/queues', queueRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/workers', workerRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/events', eventsRoutes);

  app.use(errorHandler);

  return app;
}
