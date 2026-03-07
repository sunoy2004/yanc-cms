import { ConfigService } from '@nestjs/config';
export declare class DeployService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    triggerWebsiteBuild(): Promise<{
        statusCode: number;
        body: string;
    }>;
}
