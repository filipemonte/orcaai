import { getRedisClient, SERVICES_KEY } from '../lib/redis.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const redis = await getRedisClient();

    // GET - List all services
    if (req.method === 'GET') {
      const servicesData = await redis.get(SERVICES_KEY);
      const services = servicesData ? JSON.parse(servicesData) : [];
      return res.status(200).json(services);
    }

    // POST - Create new service
    if (req.method === 'POST') {
      const newService = req.body;
      
      // Validate required fields
      if (!newService.name || !newService.unit || newService.price === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, unit, price' 
        });
      }

      const servicesData = await redis.get(SERVICES_KEY);
      const services = servicesData ? JSON.parse(servicesData) : [];
      
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
      
      services.push(serviceWithId);
      await redis.set(SERVICES_KEY, JSON.stringify(services));
      
      return res.status(201).json(serviceWithId);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/services:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
