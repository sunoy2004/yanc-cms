"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder('ipv6first');
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            disableErrorMessages: false,
        }));
        app.setGlobalPrefix('api');
        app.enableShutdownHooks();
        const port = process.env.PORT || 3001;
        await app.listen(port);
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