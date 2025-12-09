import { createClient } from 'redis';

let redis = null;

export const getRedisClient = async () => {
  if (!redis) {
    console.log('[Redis] Creating new Redis client...');
    
    // Check for REDIS_URL (Vercel Redis) or KV_URL (Vercel KV)
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    console.log('[Redis] REDIS_URL exists:', !!process.env.REDIS_URL);
    console.log('[Redis] KV_URL exists:', !!process.env.KV_URL);
    console.log('[Redis] Using URL:', redisUrl ? 'SET (hidden)' : 'NOT SET');
    
    if (!redisUrl) {
      throw new Error('REDIS_URL or KV_URL environment variable is not set. Please configure Redis in Vercel Storage.');
    }
    
    redis = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000, // 5 second timeout
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('[Redis] Too many reconnection attempts');
            return new Error('Redis connection failed');
          }
          return retries * 100;
        }
      }
    });
    
    redis.on('error', (err) => console.error('[Redis] Client Error:', err));
    redis.on('connect', () => console.log('[Redis] Connection established'));
    redis.on('ready', () => console.log('[Redis] Client ready'));
    
    console.log('[Redis] Connecting to Redis...');
    try {
      await redis.connect();
      console.log('[Redis] Connected successfully');
    } catch (error) {
      console.error('[Redis] Connection failed:', error);
      redis = null;
      throw error;
    }
  }
  
  return redis;
};

export const SERVICES_KEY = 'services';
