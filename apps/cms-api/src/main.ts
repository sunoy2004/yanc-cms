import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import dns from 'dns';
dns.setDefaultResultOrder('ipv6first');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Disable CORS for development - allows all origins
    app.enableCors({
      origin: true, // Accept all origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false, // Show detailed validation errors
    }));

    // Set global prefix
    app.setGlobalPrefix('api');

    // Shutdown hooks
    app.enableShutdownHooks();

    const port = process.env.PORT || 8080;
    await app.listen(port);
    
    console.log('=====================================');
    console.log('🚀 YANC CMS API Server Started');
    console.log(`📡 Listening on port: ${port}`);
    console.log(`🌐 API URL: http://localhost:${port}/api`);
    console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Failed to start YANC CMS API:', error);
    process.exit(1);
  }
}

bootstrap();