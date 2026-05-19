import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({ example: 1000, description: 'Amount in source currency' })
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount!: number;

  @ApiProperty({ example: 'PHP', enum: ['PHP'] })
  @IsEnum(['PHP'])
  from!: string;

  @ApiProperty({ example: 'IDR', enum: ['IDR'] })
  @IsEnum(['IDR'])
  to!: string;

  @ApiProperty({
    required: false,
    description: 'Prior tracking code for fee discount',
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;
}
