import type { RequestHandler } from 'express';

const browserCacheMs = 60; // one minute
const cdnCacheMs = 300; // five minutes
const staleWhileRevalidateMs = 60; // one minute

export const cacheHeadersMiddleware: RequestHandler = (req, res, next) => {
  res.setHeader('Cache-Control', `public, max-age=${browserCacheMs}`);
  res.setHeader('CDN-Cache-Control', `max-age=${cdnCacheMs}, stale-while-revalidate=${staleWhileRevalidateMs}`);
  next();
};
