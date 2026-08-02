import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class VoyageAiPrompts {
  @Prompt({
    name: 'plan_trip_prompt',
    description: 'Generates a structured prompt to plan a luxury travel itinerary for India.',
    arguments: [
      {
        name: 'destination',
        description: 'Target Indian destination or state (e.g. Rajasthan, Kerala, Goa, Himachal, Andamans)',
        required: true
      },
      {
        name: 'budget',
        description: 'Target budget in INR ₹ (e.g. ₹80,000)',
        required: false
      }
    ]
  })
  async planTripPrompt(args: { destination: string; budget?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Generating plan_trip_prompt', { destination: args.destination });

    const budgetText = args.budget ? ` with a budget around ${args.budget}` : '';

    return [
      {
        role: 'user' as const,
        content: `I want to plan a luxury vacation to ${args.destination}${budgetText} using Voyage AI intelligence.`
      },
      {
        role: 'assistant' as const,
        content: `I would be delighted to orchestrate your luxury journey to ${args.destination}. 

To craft your bespoke itinerary, I will evaluate multi-modal route choices, luxury palace and boutique stays, local cultural experiences, and optimal weather windows.

Shall we begin by generating your day-by-day itinerary using the \`plan_itinerary\` tool?`
      }
    ];
  }

  @Prompt({
    name: 'voyageai_help',
    description: 'Get help with Voyage AI Travel Intelligence tools and resources',
    arguments: [
      {
        name: 'topic',
        description: 'Specific topic to get help with (optional: itinerary, destinations, flights, currency)',
        required: false
      }
    ]
  })
  async getHelp(args: { topic?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Generating voyageai_help prompt', { topic: args.topic });

    return [
      {
        role: 'user' as const,
        content: `How do I use Voyage AI Travel Intelligence?`
      },
      {
        role: 'assistant' as const,
        content: `Welcome to **Voyage AI** — India's premier AI-powered luxury travel intelligence server.

Here are the tools and resources available:

### 🛠️ Tools:
1. **\`plan_itinerary\`**: Generate a complete day-by-day luxury travel itinerary for any Indian destination (e.g., Rajasthan, Kerala, Goa, Andamans).
2. **\`get_destinations\`**: Search and filter top luxury destinations by category (royal, beach, mountain, spiritual, wellness) and budget.
3. **\`check_flight_mission\`**: Inspect live flight telemetry for active luxury routes (e.g. VOY-1101 BOM → Jaisalmer).
4. **\`convert_currency\`**: Convert USD, EUR, GBP, AED, SGD budgets directly to Indian Rupees (INR ₹).

### 📁 Resources:
- \`voyageai://destinations\`: Full JSON index of curated luxury Indian destinations.
- \`voyageai://live-missions\`: Real-time flight tracking telemetry.

Try calling \`plan_itinerary\` with your travel vision to get started!`
      }
    ];
  }
}
