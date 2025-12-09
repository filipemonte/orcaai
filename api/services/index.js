import { getRedisClient, SERVICES_KEY } from '../lib/redis.js';

export default async function handler(req, res) {
  console.log('[API /services] Request method:', req.method);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('[API /services] OPTIONS request - returning 200');
    return res.status(200).end();
  }

  try {
    console.log('[API /services] Getting Redis client...');
    const redis = await getRedisClient();

    // GET - List all services
    if (req.method === 'GET') {
      console.log('[API /services] GET - Fetching services from Redis...');
      const servicesData = await redis.get(SERVICES_KEY);
      console.log('[API /services] Redis data exists:', !!servicesData);
      
      const services = servicesData ? JSON.parse(servicesData) : [];
      console.log('[API /services] Returning', services.length, 'services');
      return res.status(200).json(services);
    }

    // POST - Create new service
    if (req.method === 'POST') {
      console.log('[API /services] POST - Creating new service...');
      const newService = req.body;
      console.log('[API /services] Request body:', newService);
      
      // Validate required fields
      if (!newService.name || !newService.unit || newService.price === undefined) {
        console.log('[API /services] Validation failed - missing fields');
        return res.status(400).json({ 
          error: 'Missing required fields: name, unit, price' 
        });
      }

      const servicesData = await redis.get(SERVICES_KEY);
      const services = servicesData ? JSON.parse(servicesData) : [];
      console.log('[API /services] Current services count:', services.length);
      
      // Generate new ID (find max ID and increment)
      const maxId = services.length > 0 
        ? Math.max(...services.map(s => s.id)) 
        : 100000;
      
      const serviceWithId = {
        id: maxId + 1,
        name: newService.name,
        unit: newService.unit,
        price: parseFloat(newService.price)
      };
      
      console.log('[API /services] New service created with ID:', serviceWithId.id);
      services.push(serviceWithId);
      await redis.set(SERVICES_KEY, JSON.stringify(services));
      console.log('[API /services] Service saved to Redis');
      
      return res.status(201).json(serviceWithId);
    }

    console.log('[API /services] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API /services] ERROR:', error);
    console.error('[API /services] Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
