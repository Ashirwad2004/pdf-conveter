import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import jobsRouter from './routes/jobs';
import uploadRouter from './routes/upload';

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    exposedHeaders: ['Content-Disposition'],
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PDF Converter API' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api' });
});

app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/upload', uploadRouter);

// Download endpoint - forces browser to download the converted file
app.get('/api/v1/download', (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) {
        return res.status(400).json({ status: 'error', message: 'Missing path query parameter' });
    }

    const absolutePath = path.join(process.cwd(), 'uploads', filePath);

    // Security: prevent path traversal attacks
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(absolutePath);
    if (!resolvedPath.startsWith(uploadsDir)) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    if (!fs.existsSync(resolvedPath)) {
        console.error(`[Download] File not found: ${resolvedPath}`);
        return res.status(404).json({ status: 'error', message: 'File not found' });
    }

    // Serve with correct MIME type and force download
    const fileName = path.basename(resolvedPath);
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    console.log(`[Download] Serving: ${resolvedPath} as ${contentType}`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.download(resolvedPath, fileName, (err) => {
        if (err) {
            console.error('[Download] Error:', err);
            if (!res.headersSent) {
                res.status(500).json({ status: 'error', message: 'Download failed' });
            }
        }
    });
});

export { app };
