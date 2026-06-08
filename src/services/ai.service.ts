const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are the AI Assistant for Redemption OS — an intelligent platform serving a large religious event/gathering. You help attendees, staff, and volunteers navigate and use the platform.

You can help with:
- Venue navigation: Halls A-F, Gates 1-6, Parking Lots A-C, Medical Centre (West Wing), Cafeteria (Ground Floor), Children's Zone (East Wing), Security Office (Main Entrance)
- Event schedule: Main Service 9:00 AM - 1:00 PM, Children's Program 9:30 AM - 12:30 PM, Marketplace open all day, Evening service 5:00 PM - 8:00 PM
- Emergency guidance: Direct people to Security (+234 800 911 0000), Medical Centre (West Wing), Emergency exits at all 6 gates
- Child safety: Parents can register children via the QR Identity system in the app
- Marketplace: 30+ vendors, food, books, clothing, electronics. Orders deliver within 20-30 minutes
- Community signals: Users can report issues in the Community Signal section
- Family reunification: Scan QR code at any security checkpoint

Crowd status (live demo data):
- Main Hall: 85% capacity (HIGH - suggest alternate entry via Gate 4)
- Hall B: 40% capacity (LOW)
- Hall C: 62% capacity (MEDIUM)
- Parking Lot A: FULL - use Lot B (200m east)
- Children's Zone: 70% capacity

Keep responses concise, helpful, and actionable. Always offer to guide users to the relevant app section. Be empathetic and use a warm, supportive tone appropriate for a faith-based event.`;

const FALLBACK_RESPONSES: Record<string, { content: string; suggestions: string[] }> = {
  default: {
    content: "I'm here to help! I can assist with navigation, event schedules, emergency guidance, marketplace orders, and child safety. What do you need?",
    suggestions: ["Where is Hall B?", "Find the medical centre", "How do I register my child?", "What's in the marketplace?"],
  },
  navigation: {
    content: "Hall B is in the North Wing, 200m from the main entrance. It's currently at 40% capacity — the least crowded hall. Gate 4 offers the fastest access right now.",
    suggestions: ["How do I get to Hall C?", "Where is parking?", "Find the cafeteria"],
  },
  medical: {
    content: "The Medical Centre is in the West Wing, Ground Floor. First aid stations are also at every gate. For emergencies, call Security: +234 800 911 0000, or use the Emergency SOS button in the app.",
    suggestions: ["Call emergency", "Where is security?", "Report an incident"],
  },
  child: {
    content: "To register your child: go to Dashboard → QR Identity → Register Child. You'll fill in their details, upload a photo, and receive a printable QR tag. Security can scan this for instant identification.",
    suggestions: ["Go to QR Identity", "What if my child is lost?", "How does family reunification work?"],
  },
  marketplace: {
    content: "The marketplace has 30+ verified vendors — food, books, clothing, and more. Browse in the Marketplace section, add items to cart, and your order will be delivered to your seat within 20-30 minutes.",
    suggestions: ["Browse marketplace", "Track my order", "Contact a vendor"],
  },
  emergency: {
    content: "For emergencies: 1) Use the red SOS button in the Emergency Response section, 2) Call Security: +234 800 911 0000, 3) Go to the nearest gate — all have emergency staff. Stay calm and your location will be shared automatically.",
    suggestions: ["Activate SOS", "Find nearest exit", "Report lost child"],
  },
  crowd: {
    content: "Current crowd levels: Main Hall 85% (HIGH — use Gate 4), Hall B 40% (LOW — recommended), Hall C 62% (MEDIUM), Parking Lot A FULL (use Lot B). I recommend Hall B for a more comfortable experience.",
    suggestions: ["Navigate to Hall B", "Where is Gate 4?", "Check parking"],
  },
};

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/hall|gate|park|cafeteria|toilet|bathroom|restroom|where is|navigate|direction|east|west/))
    return 'navigation';
  if (lower.match(/medical|doctor|nurse|sick|hurt|injury|pain|hospital|first aid/))
    return 'medical';
  if (lower.match(/child|kid|son|daughter|qr|register|family|lost child|reunif/))
    return 'child';
  if (lower.match(/market|shop|buy|vendor|food|order|deliver|cart|product/))
    return 'marketplace';
  if (lower.match(/emergency|sos|danger|help|urgent|police|security/))
    return 'emergency';
  if (lower.match(/crowd|capacity|busy|full|people|many/))
    return 'crowd';
  return 'default';
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

export class AIService {
  private isAvailable = !!OPENAI_API_KEY && OPENAI_API_KEY !== 'undefined';

  async chat(messages: AIMessage[]): Promise<AIMessage> {
    if (this.isAvailable) {
      try {
        const response = await fetch(OPENAI_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? '';

        return {
          role: 'assistant',
          content,
          suggestions: this.generateSuggestions(content),
        };
      } catch (error) {
        console.warn('OpenAI unavailable, using fallback:', error);
        return this.getFallbackResponse(messages[messages.length - 1]?.content ?? '');
      }
    }

    return this.getFallbackResponse(messages[messages.length - 1]?.content ?? '');
  }

  getFallbackResponse(userMessage: string): AIMessage {
    const intent = detectIntent(userMessage);
    const fallback = FALLBACK_RESPONSES[intent] ?? FALLBACK_RESPONSES.default;
    return {
      role: 'assistant',
      content: fallback.content,
      suggestions: fallback.suggestions,
    };
  }

  private generateSuggestions(content: string): string[] {
    const lower = content.toLowerCase();
    if (lower.includes('hall b') || lower.includes('navigate'))
      return ['Navigate to Hall B', 'Check crowd levels', 'Find parking'];
    if (lower.includes('medical') || lower.includes('emergency'))
      return ['Call emergency', 'Find security', 'Report incident'];
    if (lower.includes('child') || lower.includes('qr'))
      return ['Register child', 'Print QR tag', 'Family reunification'];
    if (lower.includes('marketplace') || lower.includes('order'))
      return ['Browse marketplace', 'Track my order', 'View cart'];
    return ['Where is Hall B?', 'Check crowd levels', 'Find medical centre'];
  }

  get apiAvailable(): boolean {
    return this.isAvailable;
  }
}

export const aiService = new AIService();
