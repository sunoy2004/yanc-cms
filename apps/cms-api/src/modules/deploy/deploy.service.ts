import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import { URL } from 'url';

@Injectable()
export class DeployService {
  private readonly logger = new Logger(DeployService.name);

  constructor(private readonly configService: ConfigService) {}

  async triggerWebsiteBuild(): Promise<{ statusCode: number; body: string }> {
    const webhookUrl = this.configService.get<string>('WEBSITE_BUILD_WEBHOOK_URL');
    const webhookSecret = this.configService.get<string>('WEBSITE_BUILD_WEBHOOK_SECRET');

    if (!webhookUrl) {
      this.logger.error('WEBSITE_BUILD_WEBHOOK_URL is not configured');
      throw new Error('Website build webhook URL is not configured on the server');
    }

    const url = new URL(webhookUrl);
    const payloadObj: Record<string, any> = {
      source: 'yanc-cms',
      triggeredAt: new Date().toISOString(),
    };

    if (webhookSecret) {
      payloadObj.secret = webhookSecret;
    }

    const payload = JSON.stringify(payloadObj);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    this.logger.log(`Triggering website build via webhook: ${url.origin}${url.pathname}`);

    return new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const statusCode = res.statusCode || 0;
          if (statusCode >= 200 && statusCode < 300) {
            this.logger.log(`Website build webhook responded with ${statusCode}`);
            resolve({ statusCode, body: data });
          } else {
            this.logger.error(`Website build webhook failed with ${statusCode}: ${data}`);
            reject(new Error(`Webhook responded with status ${statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        this.logger.error('Error calling website build webhook', err);
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }
}

