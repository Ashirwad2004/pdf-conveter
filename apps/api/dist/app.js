"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const upload_1 = __importDefault(require("./routes/upload"));

const app = (0, express_1.default)();
exports.app = app;

// Middleware
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    exposedHeaders: ['Content-Disposition'],
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PDF Converter API' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api' });
});

app.use('/api/v1/jobs', jobs_1.default);
app.use('/api/v1/upload', upload_1.default);

// Download endpoint - forces browser to download the converted file
app.get('/api/v1/download', (req, res) => {
    const filePath = req.query.path;
    if (!filePath) {
        return res.status(400).json({ status: 'error', message: 'Missing path query parameter' });
    }

    const absolutePath = path_1.default.join(process.cwd(), 'uploads', filePath);

    // Security: prevent path traversal attacks
    const uploadsDir = path_1.default.resolve(process.cwd(), 'uploads');
    const resolvedPath = path_1.default.resolve(absolutePath);
    if (!resolvedPath.startsWith(uploadsDir)) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    if (!fs_1.default.existsSync(resolvedPath)) {
        console.error(`[Download] File not found: ${resolvedPath}`);
        return res.status(404).json({ status: 'error', message: 'File not found' });
    }

    // Serve with correct MIME type and force download
    const fileName = path_1.default.basename(resolvedPath);
    const ext = path_1.default.extname(fileName).toLowerCase();
    const mimeTypes = {
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
