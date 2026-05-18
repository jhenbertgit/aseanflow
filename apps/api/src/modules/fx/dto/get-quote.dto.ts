import { IsEnum, IsNumber, Max, Min } from 'class-validator';

export class GetQuoteDto {
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount!: number;

  @IsEnum(['PHP'])
  from!: string;

  @IsEnum(['IDR'])
  to!: string;
}
