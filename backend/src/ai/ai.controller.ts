import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('inventory')
  async getInventory() {
    return await this.aiService.getAllInventoryItems();
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body('prompt') prompt: string) {
    // Calling your exact method signature here
    return await this.aiService.handleInventoryQuery(prompt);
  }
}