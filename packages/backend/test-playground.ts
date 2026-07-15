import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ResolveAgentService } from './src/routing/routing-core/resolve-agent.service';

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const resolver = app.get(ResolveAgentService);
    
    const tenantId = '8d710f31-6df8-4c94-9b1c-67a670ffee06';
    const agentName = 'Playground';
    console.log("Resolving agent...");
    const agent = await resolver.resolve(tenantId, agentName, { allowPlayground: true });
    console.log("Agent found:", agent.name);
    await app.close();
  } catch (e) {
    console.error("Error during execution:", e);
  }
}
bootstrap();
