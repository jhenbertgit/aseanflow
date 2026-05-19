import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MorphService } from './morph.service';
import { PrismaService } from '../../common/services/prisma.service';
import { createHash } from 'crypto';

const mockTransfer = {
  id: 'clx_test123',
  sendAmount: { toString: () => '1000.00' },
  receiveAmount: { toString: () => '28000000.00' },
  exchangeRate: { toString: () => '28000.000000' },
  createdAt: new Date('2026-05-18T12:00:00Z'),
  status: 'SETTLED',
};

const mockTransfer2 = {
  id: 'clx_test456',
  sendAmount: { toString: () => '500.00' },
  receiveAmount: { toString: () => '14000000.00' },
  exchangeRate: { toString: () => '28000.000000' },
  createdAt: new Date('2026-05-18T12:00:00Z'),
  status: 'SETTLED',
};

describe('MorphService', () => {
  let service: MorphService;
  let prisma: { transfer: { findUnique: jest.Mock; update: jest.Mock } };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    prisma = {
      transfer: {
        findUnique: jest.fn().mockResolvedValue(mockTransfer),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    config = {
      get: jest.fn((key: string) => {
        if (key === 'MORPH_PRIVATE_KEY') return '';
        if (key === 'MORPH_CHAIN_ID') return '2910';
        if (key === 'MORPH_RPC_URL') return 'https://rpc-hoodi.morph.network';
        return undefined;
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        MorphService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<MorphService>(MorphService);
  });

  describe('generateProof', () => {
    it('produces deterministic SHA-256 proof hash', () => {
      const hash1 = service.generateProof(mockTransfer);
      const hash2 = service.generateProof(mockTransfer);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('produces different hashes for different transfers', () => {
      const hash1 = service.generateProof(mockTransfer);
      const hash2 = service.generateProof(mockTransfer2);
      expect(hash1).not.toBe(hash2);
    });

    it('matches manual SHA-256 computation', () => {
      const payload = JSON.stringify({
        transferId: 'clx_test123',
        amountPHP: '1000.00',
        amountIDR: '28000000.00',
        rate: '28000.000000',
        timestamp: Math.floor(
          new Date('2026-05-18T12:00:00Z').getTime() / 1000,
        ),
      });
      const expected = createHash('sha256').update(payload).digest('hex');

      const result = service.generateProof(mockTransfer);
      expect(result).toBe(expected);
    });
  });

  describe('anchorProof', () => {
    it('stores morphTxHash on transfer', async () => {
      const result = await service.anchorProof('clx_test123');

      expect(result.txHash).toMatch(/^0x[a-f0-9]{64}$/);
      expect(result.proofHash).toMatch(/^[a-f0-9]{64}$/);
      expect(prisma.transfer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'clx_test123' },
          data: { morphTxHash: result.txHash },
        }),
      );
    });

    it('throws if transfer not found', async () => {
      prisma.transfer.findUnique.mockResolvedValueOnce(null);

      await expect(service.anchorProof('missing')).rejects.toThrow(
        'Transfer missing not found for morph anchoring',
      );
    });

    it('throws if transfer not SETTLED', async () => {
      prisma.transfer.findUnique.mockResolvedValueOnce({
        ...mockTransfer,
        status: 'CREATED',
      });

      await expect(service.anchorProof('clx_test123')).rejects.toThrow(
        'not SETTLED',
      );
    });
  });
});
