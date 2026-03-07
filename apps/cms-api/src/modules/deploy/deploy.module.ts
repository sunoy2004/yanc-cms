import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeployController } from './deploy.controller';
import { DeployService } from './deploy.service';

@Module({
  imports: [ConfigModule],
  controllers: [DeployController],
  providers: [DeployService],
})
export class DeployModule {}

