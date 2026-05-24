import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CurrenciesDiffer } from '../../../common/decorators/currencies-differ.decorator';

export class CreateTransferDto {
  @ApiProperty({ example: 1000, description: 'Amount in source currency' })
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount!: number;

  @ApiProperty({ example: 'PHP', enum: ['PHP', 'IDR'] })
  @IsEnum(['PHP', 'IDR'])
  from!: string;

  @ApiProperty({ example: 'IDR', enum: ['PHP', 'IDR'] })
  @IsEnum(['PHP', 'IDR'])
  @CurrenciesDiffer({ message: 'Source and target currencies must differ' })
  to!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  quoteId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({
    required: false,
    description: 'Prior tracking code for returning users',
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;
}
