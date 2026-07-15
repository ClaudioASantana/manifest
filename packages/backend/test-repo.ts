import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Agent } from './src/entities/agent.entity';
import { IsNull } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get(getRepositoryToken(Agent));
  const tenantId = '8d710f31-6df8-4c94-9b1c-67a670ffee06';
  
  console.log("Finding exact Playground:");
  const a1 = await repo.findOne({ where: { tenant_id: tenantId, name: 'Playground', deleted_at: IsNull() }});
  console.log("With IsNull:", a1?.name || "NOT FOUND");

  const a2 = await repo.findOne({ where: { tenant_id: tenantId, name: 'Playground' }});
  console.log("Without IsNull:", a2?.name || "NOT FOUND");

  console.log("All Playground agents:");
  const all = await repo.find({ where: { tenant_id: tenantId, name: 'Playground' }});
  console.dir(all);

  await app.close();
}
bootstrap();
