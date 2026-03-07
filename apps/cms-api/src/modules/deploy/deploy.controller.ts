import { Controller, Post } from '@nestjs/common';
import { DeployService } from './deploy.service';

@Controller('deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  @Post('website')
  async triggerWebsiteBuild() {
    const result = await this.deployService.triggerWebsiteBuild();

    return {
      success: true,
      message: 'Website build has been triggered.',
      statusCode: result.statusCode,
    };
  }
}

