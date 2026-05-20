import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController], // ◄ Registered cleanly
  providers: [AiService],
})
export class AiModule {}