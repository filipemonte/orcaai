import { createClient } from 'redis';

let redis = null;

export const getRedisClient = async () => {
  if (!redis) {
    console.log('[Redis] Creating new Redis client...');
    console.log('[Redis] KV_URL exists:', !!process.env.KV_URL);
    
    redis = createClient({
      url: process.env.KV_URL,
    });
    
    redis.on('error', (err) => console.error('[Redis] Client Error:', err));
    
    console.log('[Redis] Connecting to Redis...');
    await redis.connect();
    console.log('[Redis] Connected successfully');
  }
  
  return redis;
};

export const SERVICES_KEY = 'services';
