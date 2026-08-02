import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { VoyageAIModule } from './modules/voyageai/voyageai.module.js';
import { SystemHealthCheck } from './health/system.health.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'voyageai-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Voyage AI MCP Server',
  imports: [
    ConfigModule.forRoot(),
    VoyageAIModule
  ],
  providers: [
    SystemHealthCheck
  ]
})
export class AppModule {}
