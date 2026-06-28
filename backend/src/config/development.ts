export const config = {
  cors: {
    origin: 'http://localhost:8080',
    credentials: true,
  },
  cookies: {
    secure: false,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // higher limit in development
  },
};
