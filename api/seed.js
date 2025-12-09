import { getRedisClient, SERVICES_KEY } from './lib/redis.js';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('[Seed] Loading services data from file...');
const servicesData = JSON.parse(
  readFileSync(join(process.cwd(), 'src', 'data', 'services.json'), 'utf-8')
);
console.log('[Seed] Loaded', servicesData.length, 'services from file');

export default async function handler(req, res) {
  console.log('[API /seed] Request method:', req.method);
  
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
