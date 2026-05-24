import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Length,
  Matches,
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

  @ApiProperty({ example: 'WALLET', enum: ['WALLET', 'BANK'] })
  @IsEnum(['WALLET', 'BANK'])
  recipientType!: string;

  @ApiProperty({
    required: false,
    description: 'ASEANFlow wallet ID (required when recipientType is WALLET)',
  })
  @IsOptional()
  @IsString()
  recipientWalletId?: string;

  @ApiProperty({
    required: false,
    description: 'Recipient full name (required when recipientType is BANK)',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  recipientName?: string;

  @ApiProperty({
    required: false,
    description: 'Bank code (required when recipientType is BANK)',
  })
  @IsOptional()
  @IsString()
  recipientBank?: string;

  @ApiProperty({
    required: false,
    description: 'Bank account number (required when recipientType is BANK)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{6,20}$/, {
    message: 'Account number must be 6-20 digits',
  })
  recipientAccount?: string;
}
