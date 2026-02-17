import { app } from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, async () => {
    console.log(`API Server running at http://localhost:${port}`);

    // Check Redis
    try {
        const { conversionQueue } = await import('./queue');
        await conversionQueue.waitUntilReady();
        console.log('Redis Queue connected');
    } catch (e: any) {
        console.error('Redis connection failed:', e.message);
    }
});
