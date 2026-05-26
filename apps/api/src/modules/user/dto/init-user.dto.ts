import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitUserDto {
  @ApiProperty({ description: 'UUID cookie token' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  cookieToken!: string;
}
