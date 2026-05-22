import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SettlementService } from './settlement.service';
import { InstapaySimulator } from './instapay.simulator';
import { BifastSimulator } from './bifast.simulator';
import { TransferService } from '../transfer/transfer.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('InstapaySimulator', () => {
  let simulator: InstapaySimulator;

  beforeEach(() => {
    simulator = new InstapaySimulator();
  });

  it('returns SUCCESS with IPS reference', async () => {
    const result = await simulator.simulate();
    expect(result.status).toBe('SUCCESS');
    expect(result.reference).toMatch(/^IPS[0-9A-F]{8}$/);
    expect(result.timestamp).toBeGreaterThan(0);
  });

  it('takes 1000-1500ms', async () => {
    const start = Date.now();
    await simulator.simulate();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(1000);
    expect(elapsed).toBeLessThanOrEqual(1600); // small buffer
  });
});

describe('BifastSimulator', () => {
  let simulator: BifastSimulator;

  beforeEach(() => {
    simulator = new BifastSimulator();
  });

  it('returns SUCCESS with BIF reference', async () => {
    const result = await simulator.simulate();
    expect(result.status).toBe('SUCCESS');
    expect(result.reference).toMatch(/^BIF[0-9A-F]{8}$/);
    expect(result.timestamp).toBeGreaterThan(0);
  });

  it('takes 1000-1500ms', async () => {
    const start = Date.now();
    await simulator.simulate();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(1000);
    expect(elapsed).toBeLessThanOrEqual(1600);
  });
});

describe('SettlementService', () => {
  let service: SettlementService;
  let transferService: { advanceStatus: jest.Mock };
  let instapay: { simulate: jest.Mock };
  let bifast: { simulate: jest.Mock };
  let prisma: { transfer: { update: jest.Mock; findUnique: jest.Mock } };
  let eventEmitter: { emit: jest.Mock };
  let morphQueue: { add: jest.Mock };

  beforeEach(async () => {
    transferService = { advanceStatus: jest.fn().mockResolvedValue({}) };
    instapay = {
      simulate: jest.fn().mockResolvedValue({
        status: 'SUCCESS',
        reference: 'IPS12345678',
        timestamp: Date.now(),
      }),
    };
    bifast = {
      simulate: jest.fn().mockResolvedValue({
        status: 'SUCCESS',
        reference: 'BIF12345678',
        timestamp: Date.now(),
      }),
    };
    prisma = {
      transfer: {
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn().mockResolvedValue({
          trackingCode: 'TXNTEST',
          sourceCurrency: 'PHP',
        }),
      },
    };
    eventEmitter = { emit: jest.fn() };
    morphQueue = { add: jest.fn().mockResolvedValue({}) };

    const module = await Test.createTestingModule({
      providers: [
        SettlementService,
        { provide: TransferService, useValue: transferService },
        { provide: InstapaySimulator, useValue: instapay },
        { provide: BifastSimulator, useValue: bifast },
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: 'MORPH_QUEUE', useValue: morphQueue },
      ],
    }).compile();

    service = module.get<SettlementService>(SettlementService);
  });

  it('advances through all states in correct order', async () => {
    await service.orchestrate('t1');

    const calls = transferService.advanceStatus.mock.calls.map(
      (c: string[]) => c[1],
    );
    expect(calls).toEqual([
      'QUOTE_LOCKED',
      'INSTA_PAY_PROCESSING',
      'FX_CONVERSION',
      'BI_FAST_PROCESSING',
      'SETTLED',
    ]);
  });

  it('stores instapayRef on transfer', async () => {
    await service.orchestrate('t1');

    expect(prisma.transfer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: { instapayRef: 'IPS12345678' },
      }),
    );
  });

  it('stores bifastRef on transfer', async () => {
    await service.orchestrate('t1');

    expect(prisma.transfer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: { bifastRef: 'BIF12345678' },
      }),
    );
  });

  it('emits transfer.settled event', async () => {
    await service.orchestrate('t1');

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'transfer.settled',
      expect.objectContaining({
        transferId: 't1',
      }),
    );
  });

  it('queues morph-anchor job after SETTLED', async () => {
    await service.orchestrate('t1');

    expect(morphQueue.add).toHaveBeenCalledWith('anchor', {
      transferId: 't1',
    });
  });

  it('calls simulators during orchestration', async () => {
    await service.orchestrate('t1');

    expect(instapay.simulate).toHaveBeenCalled();
    expect(bifast.simulate).toHaveBeenCalled();
  });

  it('swaps simulator order for IDR→PHP', async () => {
    prisma.transfer.findUnique.mockResolvedValue({
      trackingCode: 'TXNIDR',
      sourceCurrency: 'IDR',
    });

    await service.orchestrate('t2');

    const calls = transferService.advanceStatus.mock.calls.map(
      (c: string[]) => c[1],
    );
    expect(calls).toEqual([
      'QUOTE_LOCKED',
      'BI_FAST_PROCESSING',
      'FX_CONVERSION',
      'INSTA_PAY_PROCESSING',
      'SETTLED',
    ]);
  });
});
