import setRateLimit from 'express-rate-limit';

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'You have exceeded your 5 requests per minute limit.',
  headers: true,
});

export default rateLimitMiddleware;
