// Mock for @aseanflow/database — avoids ESM import.meta issues in Jest
export const TransferStatus = {
  CREATED: 'CREATED',
  QUOTE_LOCKED: 'QUOTE_LOCKED',
  INSTA_PAY_PROCESSING: 'INSTA_PAY_PROCESSING',
  FX_CONVERSION: 'FX_CONVERSION',
  BI_FAST_PROCESSING: 'BI_FAST_PROCESSING',
  SETTLED: 'SETTLED',
  MORPH_ANCHORED: 'MORPH_ANCHORED',
} as const;

export type TransferStatus =
  (typeof TransferStatus)[keyof typeof TransferStatus];

class MockDecimal {
  private readonly v: number;
  constructor(value: number | string | MockDecimal) {
    this.v = value instanceof MockDecimal ? value.v : Number(value);
  }
  div(other: number | string | MockDecimal): MockDecimal {
    const b = other instanceof MockDecimal ? other.v : Number(other);
    return new MockDecimal(this.v / b);
  }
  mul(other: number | string | MockDecimal): MockDecimal {
    const b = other instanceof MockDecimal ? other.v : Number(other);
    return new MockDecimal(this.v * b);
  }
  toNumber(): number {
    return this.v;
  }
  toString(): string {
    return String(this.v);
  }
}

export class Prisma {
  static Decimal = MockDecimal;
}

export class PrismaClient {
  transfer = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  ledgerEntry = {
    create: jest.fn(),
    findMany: jest.fn(),
  };
  wallet = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  $connect = jest.fn();
  $disconnect = jest.fn();
}
