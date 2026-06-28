export const config = {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  },
  cookies: {
    secure: true,
    sameSite: 'lax' as const, // sameSite lax in production for secure cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per 15 minutes in production
  },
};
