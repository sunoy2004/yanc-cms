// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import dns from 'dns';
// //dns.setDefaultResultOrder('ipv6first');
// dns.setDefaultResultOrder('ipv4first');


// async function bootstrap() {
//   try {
//     const app = await NestFactory.create(AppModule);
    
//     // Disable CORS for development - allows all origins
//     app.enableCors({
//       origin: true, // Accept all origins
//       credentials: true,
//       methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//       allowedHeaders: ['Content-Type', 'Authorization'],
//     });

//     // Global validation pipe
//     app.useGlobalPipes(new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//       disableErrorMessages: false, // Show detailed validation errors
//     }));

//     // Set global prefix
//     app.setGlobalPrefix('api');

//     // Shutdown hooks
//     app.enableShutdownHooks();

//     const port = process.env.PORT || 8080;
//     await app.listen(port, '0.0.0.0');

//     console.log(`🚀 CMS API running on port ${port}`);
    
//     console.log('=====================================');
//     console.log('🚀 YANC CMS API Server Started');
//     console.log(`📡 Listening on port: ${port}`);
//     console.log(`🌐 API URL: http://localhost:${port}/api`);
//     console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
//     console.log('=====================================');
    
//   } catch (error) {
//     console.error('❌ Failed to start YANC CMS API:', error);
//     process.exit(1);
//   }
// }

// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import dns from 'dns';

// Prefer IPv4 ordering in environments where IPv6 causes DNS resolution issues
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // CORS configuration - allow specific trusted origins (and common local dev origins)
    const allowedOrigins = [
      'https://website-1095720168864.asia-south1.run.app',
      'https://ynac-cms-bk-1095720168864.asia-south1.run.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000'
    ];

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like server-to-server or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      // Expose headers if you rely on them client-side
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
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
    // Bind to all interfaces in containerized environments
    await app.listen(port, '0.0.0.0');

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
