import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/services/prisma.service';
import type { RedisClientType } from '@aseanflow/redis';

@ApiTags('Health')
@Controller('api/health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check service health' })
  async check() {
    const [pgResult, redisResult] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.ping(),
    ]);

    const pgOk = pgResult.status === 'fulfilled';
    const redisOk = redisResult.status === 'fulfilled';
    const allOk = pgOk && redisOk;

    return {
      status: allOk ? 'ok' : 'degraded',
      services: {
        postgres: pgOk ? 'up' : 'down',
        redis: redisOk ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
