import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { SimulationResult } from './instapay.simulator';

@Injectable()
export class BifastSimulator {
  async simulate(): Promise<SimulationResult> {
    const delay = 1000 + Math.random() * 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return {
      status: 'SUCCESS',
      reference: 'BIF' + randomBytes(4).toString('hex').toUpperCase(),
      timestamp: Date.now(),
    };
  }
}
