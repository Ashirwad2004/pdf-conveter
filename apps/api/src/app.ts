import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jobsRouter from './routes/jobs';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api' });
});

app.use('/api/v1/jobs', jobsRouter);

export { app };
