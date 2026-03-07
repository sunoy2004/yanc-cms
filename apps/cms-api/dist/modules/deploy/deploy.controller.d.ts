import { DeployService } from './deploy.service';
export declare class DeployController {
    private readonly deployService;
    constructor(deployService: DeployService);
    triggerWebsiteBuild(): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
    }>;
}
