import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { TransferModule } from '../transfer/transfer.module';
import { LedgerModule } from '../ledger/ledger.module';
import { SettlementService } from './settlement.service';
import { InstapaySimulator } from './instapay.simulator';
import { BifastSimulator } from './bifast.simulator';

@Module({
  imports: [forwardRef(() => TransferModule), LedgerModule],
  providers: [
    InstapaySimulator,
    BifastSimulator,
    SettlementService,
    {
      provide: 'MORPH_QUEUE',
      useFactory: (configService: ConfigService) => {
        return new Queue('morph-anchor', {
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6380),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'REWARD_MINT_QUEUE',
      useFactory: (configService: ConfigService) => {
        return new Queue('reward-mint', {
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6380),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SETTLEMENT_QUEUE',
      useFactory: (configService: ConfigService) => {
        return new Queue('settlement', {
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6380),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SettlementService, 'SETTLEMENT_QUEUE'],
})
export class SettlementModule {}
