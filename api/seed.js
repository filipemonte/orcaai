import { getRedisClient, SERVICES_KEY } from './lib/redis.js';

export default async function handler(req, res) {
  console.log('[API /seed] Request method:', req.method);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    console.log('[API /seed] OPTIONS request - returning 200');
    return res.status(200).end();
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    console.log('[API /seed] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API /seed] Getting Redis client...');
    const redis = await getRedisClient();
    
    // Check if services already exist
    console.log('[API /seed] Checking for existing data...');
    const existingData = await redis.get(SERVICES_KEY);
    
    if (existingData) {
      const count = JSON.parse(existingData).length;
      console.log('[API /seed] Services already exist. Count:', count);
      return res.status(200).json({ 
        message: 'Services already exist in Redis. Use force=true to overwrite.',
        count: count 
      });
    }
    
    // Get services data from request body or use default
    let servicesData = req.body?.services;
    
    if (!servicesData || !Array.isArray(servicesData)) {
      console.log('[API /seed] No services provided in body, using default data...');
      // Default minimal services for quick seed
      servicesData = [
        {"id":100001,"name":"Massa corrida reboco","unit":"m²","price":17.6},
        {"id":100002,"name":"Massa corrida drywall","unit":"m²","price":14},
        {"id":100003,"name":"Pintura parede interna PVA","unit":"m²","price":10.5},
        {"id":100004,"name":"Pintura parede interna acrílica","unit":"m²","price":13},
        {"id":100005,"name":"Pintura parede externa acrílica","unit":"m²","price":14.8}
      ];
    }
    
    // Seed the data
    console.log('[API /seed] Seeding', servicesData.length, 'services to Redis...');
    await redis.set(SERVICES_KEY, JSON.stringify(servicesData));
    console.log('[API /seed] Services seeded successfully');
    
    return res.status(200).json({ 
      message: 'Services seeded successfully',
      count: servicesData.length 
    });
  } catch (error) {
    console.error('[API /seed] ERROR:', error);
    console.error('[API /seed] Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
