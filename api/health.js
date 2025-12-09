import { getRedisClient, SERVICES_KEY } from './lib/redis.js';

export default async function handler(req, res) {
  console.log('[API /health] Health check requested');
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Test Redis connection
    console.log('[API /health] Testing Redis connection...');
    const redis = await getRedisClient();
    
    // Try to get services
    console.log('[API /health] Getting services from Redis...');
    const servicesData = await redis.get(SERVICES_KEY);
    const servicesCount = servicesData ? JSON.parse(servicesData).length : 0;
    
    console.log('[API /health] Health check passed');
    return res.status(200).json({
      status: 'ok',
      redis: 'connected',
      servicesCount: servicesCount,
      hasData: servicesCount > 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API /health] ERROR:', error);
    console.error('[API /health] Error stack:', error.stack);
    return res.status(500).json({
      status: 'error',
      redis: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
