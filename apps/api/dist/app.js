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
const jobs_1 = __importDefault(require("./routes/jobs"));
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
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
