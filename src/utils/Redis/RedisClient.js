import { createClient } from 'redis';


const redisClient = createClient({
    url: process.env.RedisURL,
    socket: {
        reconnectStrategy: (retries) => {
           
            if (retries > 20) return new Error('Max retries reached');
            return Math.min(retries * 50, 2000);
        }
    }
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('🚀 Redis client connecting...'));
redisClient.on('ready', () => console.log('✅ Redis client ready to use!'));


const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Could not connect to Redis', error);
    }
};

connectRedis();

export default redisClient;