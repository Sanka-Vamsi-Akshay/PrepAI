import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { appConfig } from '@backend/config/env';
import { morganMiddleware } from '@backend/middlewares/morgan';
import { rateLimiter } from '@backend/middlewares/rateLimiter';
import { errorHandler } from '@backend/middlewares/errorHandler';
import { requestIdMiddleware } from '@backend/middlewares/requestId';
import apiRouter from '@backend/routes/v1/index';
import { NotFoundError } from '@backend/utils/appError';
import { csrfProtection } from '@backend/middlewares/csrf';

const app = express();

// Trust reverse proxies (like Railway load balancer) to ensure client IP and secure cookies resolve correctly
app.set('trust proxy', 1);

// 1. Request ID Middleware (Runs first to trace request life-cycles)
app.use(requestIdMiddleware);

// 2. Compression Middleware (Compresses all HTTP response payloads using gzip)
app.use(compression());

// 3. Helmet Security Review & Header Documentation
// helmet() configures secure HTTP headers automatically to defend the backend API:
// - Content-Security-Policy (CSP): Restricts resource origins, mitigating Cross-Site Scripting (XSS).
// - Strict-Transport-Security (HSTS): Enforces secure HTTPS transit connections.
// - X-Frame-Options: Set to 'SAMEORIGIN' to prevent framing clickjacking attacks.
// - X-Content-Type-Options: Set to 'nosniff' to disable automatic MIME sniffing.
// - Referrer-Policy: Controls referrer headers sent on outbound navigations.
// - X-XSS-Protection: Set to '0' to disable outdated browser XSS filters (replaced by CSP).
app.use(helmet());

// 4. CORS Setup mapping dynamically to appConfig
app.use(
  cors({
    origin: appConfig.cors.origin,
    credentials: appConfig.cors.credentials,
  })
);

// Cookie Parser (needed to extract JWT from cookies)
app.use(cookieParser());

// 3.5. CSRF Protection Middleware
app.use(csrfProtection);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(morganMiddleware);

import healthRouter from '@backend/routes/v1/health';

// Health endpoints mounted before rate limiters to ensure cloud readiness probes bypass rate-limiting
app.use('/health', healthRouter);
app.use('/api/v1/health', healthRouter);

// Rate Limiting (applied to all api requests)
app.use('/api', rateLimiter);

// API Routing
app.use('/api/v1', apiRouter);

// Fallback Route (404)
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
