import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';

// Tried in order. If the first is overloaded, the second is used.
// const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

@Injectable()
export class AiService implements OnModuleInit {
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`[DEBUG] GEMINI_API_KEY length: ${apiKey?.length}, First 4 chars: '${apiKey?.substring(0, 4)}'`);
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getAllInventoryItems() {
    return this.prisma.inventoryItem.findMany({
      orderBy: { dateAdded: 'desc' },
    });
  }

  // Calls Gemini, retrying on 503 (overloaded) / 429 (rate limit),
  // then falling back to the next model in MODELS.
  // Calls Gemini and moves to the next model when one is unavailable:
  //  - 429 (quota used up)  -> next model immediately (retrying the same one just burns quota)
  //  - 404 (model retired)  -> next model immediately
  //  - 503 (overloaded)     -> one short retry, then next model
  private async generate(params: any) {
    const models = (process.env.GEMINI_MODELS ?? 'gemini-3.5-flash,gemini-3.5-flash-lite')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    let lastError: unknown;

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          return await this.ai.models.generateContent({ ...params, model });
        } catch (err: any) {
          lastError = err;
          const status = err?.status;
          console.warn(`[AI] ${model} returned ${status}${attempt === 0 && status === 503 ? ', retrying' : ''}`);

          if (status === 503 && attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue; // retry the same model once
          }
          if (status === 429 || status === 404 || status === 503) break; // try the next model
          throw err; // anything else is a real bug, so surface it
        }
      }
    }
    throw lastError;
  }

  async handleInventoryQuery(userPrompt: string) {
    const inventoryTool = {
      functionDeclarations: [
        {
          name: 'getInventoryItems',
          description:
            'Fetches products from the store database (id, name, category, price in BDT, stock). ' +
            'Call this for ANY shopping request. For specific requests (a category, a budget, out-of-stock items) use the filters. ' +
            'For vague or need-based requests (a trip, a gift, a new apartment) call it with NO filters to get the full catalog, then choose the relevant products yourself.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                enum: ['Apparel', 'Tech & Gadgets', 'Home & Living', 'Fitness & Lifestyle'],
                description: 'Optional. One category to filter by. Omit for all categories.',
              },
              maxPrice: { type: Type.NUMBER, description: 'Optional. Maximum price in BDT.' },
              inStock: {
                type: Type.BOOLEAN,
                description: 'Optional. true = only in-stock items, false = only out-of-stock items. Omit for both.',
              },
            },
          },
        },
      ],
    };

    const systemInstruction =
      'You are a shopping assistant for a Bangladeshi storefront (prices are in BDT, ৳). ' +
      'Always call getInventoryItems before answering shopping questions.';

    const finalInstruction =
      'You are a shopping assistant for a Bangladeshi storefront (prices are in BDT, ৳). ' +
      'Reply in JSON with "message" and "productIds". ' +
      'productIds must contain ONLY the ids of products from the tool result that genuinely match what the customer needs. ' +
      'Do not include unrelated products just to fill the list. ' +
      'The selected products are displayed in the product grid beside the chat, so in "message" write 1-3 friendly sentences: ' +
      'briefly say why the picks help (you may mention a few product names). ' +
      'If the store has nothing suitable, say so honestly and return an empty productIds list.';

    try {
      const response = await this.generate({
        contents: userPrompt,
        config: { tools: [inventoryTool], systemInstruction },
      });

      const call = response.functionCalls?.[0];

      if (call?.name === 'getInventoryItems') {
        const args = (call.args ?? {}) as { category?: string; maxPrice?: number; inStock?: boolean };

        const items: any[] = await this.prisma.inventoryItem.findMany({
          where: {
            ...(args.category && { category: args.category }),
            ...(args.maxPrice !== undefined && { price: { lte: args.maxPrice } }),
            ...(args.inStock === true && { stock: { gt: 0 } }),
            ...(args.inStock === false && { stock: 0 }),
          },
          orderBy: { price: 'asc' },
        });

        try {
          const finalResponse = await this.generate({
            contents: [
              { role: 'user', parts: [{ text: userPrompt }] },
              response.candidates![0].content!,
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
            config: {
              systemInstruction: finalInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  message: { type: Type.STRING },
                  productIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['message', 'productIds'],
              },
            },
          });

          const parsed = JSON.parse(finalResponse.text ?? '{}') as {
            message?: string;
            productIds?: string[];
          };

          // Keep only the products Gemini picked (fall back to all if it sent no list)
          const picked = Array.isArray(parsed.productIds)
            ? items.filter((item) => parsed.productIds!.includes(item.id))
            : items;

          return {
            response: parsed.message ?? `Found ${picked.length} matching product(s).`,
            items: picked,
          };
        } catch (err) {
          console.error('[AI] Summary call failed:', err);
          const hasFilter =
            args.category !== undefined || args.maxPrice !== undefined || args.inStock !== undefined;
          return {
            response: hasFilter
              ? `I found ${items.length} matching product${items.length === 1 ? '' : 's'}. They're shown in the grid.`
              : "Sorry, I couldn't finish picking products for that request. Please try again.",
            items: hasFilter ? items : null,
          };
        }
      }

      return { response: response.text ?? "Sorry, I couldn't come up with an answer.", items: null };
    } catch (err) {
      console.error('[AI] Request failed:', err);
      return {
        response: 'The AI service is very busy right now. Please try again in a moment.',
        items: null,
      };
    }
  }
}