import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService implements OnModuleInit {
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[DEBUG] GEMINI_API_KEY length: ${apiKey?.length}, First 4 chars: '${apiKey?.substring(0, 4)}'`);
    // Initializes the SDK using your API key from the .env file
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getAllInventoryItems() {
    return this.prisma.inventoryItem.findMany({
      orderBy: { dateAdded: 'desc' },
    });
  }

  async handleInventoryQuery(userPrompt: string) {
    // 1. Define the database tool that Gemini can use
    const inventoryTool = {
      functionDeclarations: [
        {
          name: 'getInventoryItems',
          description: 'Fetches inventory items from the database. Returns detailed product info including name, category, price, and stock levels. Use this tool whenever you need to check inventory, out-of-stock items, or pricing.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: 'Optional. The single product category to filter by (e.g., Electronics, Clothing). Omit this if the user asks for multiple categories or all items.' },
              maxPrice: { type: Type.NUMBER, description: 'Optional. The maximum price limit.' },
            },
          },
        },
      ],
    };

    // 2. Send the prompt to Gemini with the tool attached
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        tools: [inventoryTool],
        systemInstruction: 'You are an intelligent inventory management assistant. Use the provided tools to fetch real database metrics before answering user questions.',
      },
    });

    const functionCalls = response.functionCalls;

    // 3. If Gemini decides it needs data, execute the query using Prisma
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      
      if (call.name === 'getInventoryItems') {
        const args = call.args as { category?: string; maxPrice?: number };
        
        // Query our local SQLite database dynamically
        const items = await this.prisma.inventoryItem.findMany({
          where: {
            ...(args.category && { category: { equals: args.category } }),
            ...(args.maxPrice && { price: { lte: args.maxPrice } }),
          },
        });

        // 4. Send the data back to Gemini so it can formulate a natural response
        const finalResponse = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: userPrompt }] },
            { role: 'model', parts: [{ functionCall: call }] },
            {
              role: 'user',
              parts: [
                {
                  functionResponse: {
                    name: 'getInventoryItems',
                    response: { result: items },
                  },
                },
              ],
            },
          ],
        });

        return { response: finalResponse.text };
      }
    }

    // Fallback if no tool call was determined necessary
    return { response: response.text };
  }
}