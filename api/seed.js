import { getRedisClient, SERVICES_KEY } from './lib/redis.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const servicesData = JSON.parse(
  readFileSync(join(process.cwd(), 'src', 'data', 'services.json'), 'utf-8')
);

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const redis = await getRedisClient();
    
    // Check if services already exist
    const existingData = await redis.get(SERVICES_KEY);
    
    if (existingData) {
      return res.status(200).json({ 
        message: 'Services already exist in Redis. Use force=true to overwrite.',
        count: JSON.parse(existingData).length 
      });
    }
    
    // Seed the data
    await redis.set(SERVICES_KEY, JSON.stringify(servicesData));
    
    return res.status(200).json({ 
      message: 'Services seeded successfully',
      count: servicesData.length 
    });
  } catch (error) {
    console.error('Error seeding services:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
