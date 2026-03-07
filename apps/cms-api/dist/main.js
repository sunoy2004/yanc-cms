"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder('ipv4first');
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        const allowedOrigins = [
            'https://yanc-website-1095720168864.asia-south1.run.app',
            'https://ynac-cms-bk-1095720168864.asia-south1.run.app',
            'https://yanc-cms-1095720168864.asia-south1.run.app',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8080',
        ];
        const isLocalOrigin = (origin) => {
            try {
                const u = new URL(origin);
                return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
            }
            catch {
                return false;
            }
        };
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                if (allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
                    return callback(null, true);
                }
                return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
            exposedHeaders: ['Content-Range', 'X-Total-Count'],
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            disableErrorMessages: false,
        }));
        app.setGlobalPrefix('api');
        app.enableShutdownHooks();
        const port = process.env.PORT || 8080;
        await app.listen(port, '0.0.0.0');
        console.log('=====================================');
        console.log('🚀 YANC CMS API Server Started');
        console.log(`📡 Listening on port: ${port}`);
        console.log(`🌐 API URL: http://localhost:${port}/api`);
        console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
        console.log('=====================================');
    }
    catch (error) {
        console.error('❌ Failed to start YANC CMS API:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map