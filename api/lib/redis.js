import { createClient } from 'redis';

let redis = null;

export const getRedisClient = async () => {
  if (!redis) {
    redis = createClient({
      url: process.env.KV_URL,
    });
    
    redis.on('error', (err) => console.error('Redis Client Error', err));
    
    await redis.connect();
  }
  
  return redis;
};

export const SERVICES_KEY = 'services';
