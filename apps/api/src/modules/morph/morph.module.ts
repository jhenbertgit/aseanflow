import { Module } from '@nestjs/common';
import { MorphService } from './morph.service';

@Module({
  providers: [MorphService],
  exports: [MorphService],
})
export class MorphModule {}
