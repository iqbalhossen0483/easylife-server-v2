import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { TransferPurpose } from 'src/entites/transaction.entity';

export class BalanceTransferDto {
  @ApiProperty({ example: 2 })
  @IsNotEmpty({ message: 'Recipient user id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'User id must be a number' })
  to_user_id: number;

  @ApiProperty({ example: TransferPurpose.SALARY, enum: TransferPurpose })
  @IsNotEmpty({ message: 'Purpose is required' })
  @IsEnum(TransferPurpose, { message: 'Purpose is invalid' })
  purpose: TransferPurpose;

  @ApiProperty({ example: 10000 })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @ApiPropertyOptional({ example: 'March salary payment' })
  @IsOptional()
  notes?: string;
}
