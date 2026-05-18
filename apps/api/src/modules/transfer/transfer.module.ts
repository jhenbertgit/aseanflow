import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';

@Module({
  controllers: [TransferController],
  providers: [
    TransferService,
    {
      provide: 'SETTLEMENT_QUEUE',
      useFactory: (configService: ConfigService) => {
        return new Queue('settlement', {
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6380),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [TransferService],
})
export class TransferModule {}
