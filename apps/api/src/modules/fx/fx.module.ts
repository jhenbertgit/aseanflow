import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRedisClient } from '@aseanflow/redis';
import { FxService } from './fx.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        return createRedisClient({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6380),
        });
      },
      inject: [ConfigService],
    },
    FxService,
  ],
  exports: [FxService],
})
export class FxModule {}
