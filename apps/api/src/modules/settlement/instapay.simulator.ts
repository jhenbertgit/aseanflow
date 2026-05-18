import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface SimulationResult {
  status: 'SUCCESS' | 'FAILED';
  reference: string;
  timestamp: number;
}

@Injectable()
export class InstapaySimulator {
  async simulate(): Promise<SimulationResult> {
    const delay = 1000 + Math.random() * 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return {
      status: 'SUCCESS',
      reference: 'IPS' + randomBytes(4).toString('hex').toUpperCase(),
      timestamp: Date.now(),
    };
  }
}
