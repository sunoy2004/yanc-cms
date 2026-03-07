"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DeployService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const https = __importStar(require("https"));
const url_1 = require("url");
let DeployService = DeployService_1 = class DeployService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DeployService_1.name);
    }
    async triggerWebsiteBuild() {
        const webhookUrl = this.configService.get('WEBSITE_BUILD_WEBHOOK_URL');
        const webhookSecret = this.configService.get('WEBSITE_BUILD_WEBHOOK_SECRET');
        if (!webhookUrl) {
            this.logger.error('WEBSITE_BUILD_WEBHOOK_URL is not configured');
            throw new Error('Website build webhook URL is not configured on the server');
        }
        const url = new url_1.URL(webhookUrl);
        const payloadObj = {
            source: 'yanc-cms',
            triggeredAt: new Date().toISOString(),
        };
        if (webhookSecret) {
            payloadObj.secret = webhookSecret;
        }
        const payload = JSON.stringify(payloadObj);
        const options = {
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
        return new Promise((resolve, reject) => {
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
                    }
                    else {
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
};
exports.DeployService = DeployService;
exports.DeployService = DeployService = DeployService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DeployService);
//# sourceMappingURL=deploy.service.js.map