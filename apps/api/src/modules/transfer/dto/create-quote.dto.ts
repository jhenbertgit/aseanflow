import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

function CurrenciesDiffer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'currenciesDiffer',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as { from?: string; to?: string };
          return obj.from !== obj.to;
        },
        defaultMessage() {
          return 'Source and target currencies must differ';
        },
      },
    });
  };
}

export class CreateQuoteDto {
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

  @ApiProperty({
    required: false,
    description: 'Prior tracking code for fee discount',
  })
  @IsOptional()
  @IsString()
  trackingCode?: string;
}
