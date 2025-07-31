import { createClient } from 'redis';

const redis = createClient({
    url: 'redis://localhost:6379',
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis connected'));

(async () => {
    try {
        if (!redis.isOpen) await redis.connect();
    } catch (error) {
        console.error('Redis connection failed:', error);
    }
})();

export default redis;