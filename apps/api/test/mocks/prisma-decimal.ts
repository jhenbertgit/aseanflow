// Mock for @prisma/client/runtime/library — provides Decimal without ESM issues
export class Decimal {
  private readonly value: string;

  constructor(value: number | string) {
    this.value = String(value);
  }

  div(other: number | string | Decimal): Decimal {
    const a = Number(this.value);
    const b =
      typeof other === 'object' && other instanceof Decimal
        ? Number(other.value)
        : Number(other);
    return new Decimal(a / b);
  }

  toNumber(): number {
    return Number(this.value);
  }

  toString(): string {
    return this.value;
  }
}
