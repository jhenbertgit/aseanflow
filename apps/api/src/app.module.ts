import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/modules/prisma.module';
import { FxModule } from './modules/fx/fx.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { MorphModule } from './modules/morph/morph.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    PrismaModule,
    FxModule,
    TransferModule,
    LedgerModule,
    SettlementModule,
    MorphModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
