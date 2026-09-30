import { Module } from '@nitrostack/core';
import { VoyageAiTools } from './voyageai.tools.js';
import { VoyageAiResources } from './voyageai.resources.js';
import { VoyageAiPrompts } from './voyageai.prompts.js';

@Module({
  name: 'voyageai',
  description: 'Voyage AI Luxury Travel Intelligence for India',
  controllers: [VoyageAiTools, VoyageAiResources, VoyageAiPrompts]
})
export class VoyageAIModule {}
// Alias for compatibility
export class VoyageAiModule extends VoyageAIModule {}
