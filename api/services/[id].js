import { getRedisClient, SERVICES_KEY } from '../lib/redis.js';

export default async function handler(req, res) {
  console.log('[API /services/[id]] Request method:', req.method);
  console.log('[API /services/[id]] Request URL:', req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('[API /services/[id]] OPTIONS request - returning 200');
    return res.status(200).end();
  }

  // Extract ID from URL path
  const id = parseInt(req.url.split('/').pop());
  console.log('[API /services/[id]] Extracted ID:', id);
  
  if (!id || isNaN(id)) {
    console.log('[API /services/[id]] Invalid service ID');
    return res.status(400).json({ error: 'Invalid service ID' });
  }

  try {
    console.log('[API /services/[id]] Getting Redis client...');
    const redis = await getRedisClient();
    
    console.log('[API /services/[id]] Fetching services from Redis...');
    const servicesData = await redis.get(SERVICES_KEY);
    const services = servicesData ? JSON.parse(servicesData) : [];
    console.log('[API /services/[id]] Total services in Redis:', services.length);

    // GET - Get single service
    if (req.method === 'GET') {
      console.log('[API /services/[id]] GET - Looking for service with ID:', id);
      const service = services.find(s => s.id === id);
      
      if (!service) {
        console.log('[API /services/[id]] Service not found');
        return res.status(404).json({ error: 'Service not found' });
      }
      
      console.log('[API /services/[id]] Service found:', service);
      return res.status(200).json(service);
    }

    // PUT - Update service
    if (req.method === 'PUT') {
      console.log('[API /services/[id]] PUT - Updating service with ID:', id);
      const updatedData = req.body;
      console.log('[API /services/[id]] Update data:', updatedData);
      
      const index = services.findIndex(s => s.id === id);
      
      if (index === -1) {
        console.log('[API /services/[id]] Service not found for update');
        return res.status(404).json({ error: 'Service not found' });
      }
      
      // Update service while preserving ID
      services[index] = {
        id: id,
        name: updatedData.name || services[index].name,
        unit: updatedData.unit || services[index].unit,
        price: updatedData.price !== undefined 
          ? parseFloat(updatedData.price) 
          : services[index].price
      };
      
      console.log('[API /services/[id]] Service updated:', services[index]);
      await redis.set(SERVICES_KEY, JSON.stringify(services));
      console.log('[API /services/[id]] Saved to Redis');
      
      return res.status(200).json(services[index]);
    }

    // DELETE - Remove service
    if (req.method === 'DELETE') {
      console.log('[API /services/[id]] DELETE - Removing service with ID:', id);
      const filteredServices = services.filter(s => s.id !== id);
      
      if (filteredServices.length === services.length) {
        console.log('[API /services/[id]] Service not found for deletion');
        return res.status(404).json({ error: 'Service not found' });
      }
      
      await redis.set(SERVICES_KEY, JSON.stringify(filteredServices));
      console.log('[API /services/[id]] Service deleted, remaining:', filteredServices.length);
      
      return res.status(204).end();
    }

    console.log('[API /services/[id]] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API /services/[id]] ERROR:', error);
    console.error('[API /services/[id]] Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
