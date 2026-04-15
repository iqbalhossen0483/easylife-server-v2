import { CommissionStatus } from '@/entites/target.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateTargetDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'User id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'User id must be a number' })
  userId: number;

  @ApiProperty({ example: 50000 })
  @IsNotEmpty({ message: 'Target amount is required' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'Target amount must be a number' },
  )
  targeted_amnt: number;

  @ApiProperty({ example: '2026-04-01' })
  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a date' })
  start_date: Date;

  @ApiProperty({ example: '2026-04-30' })
  @IsNotEmpty({ message: 'End date is required' })
  @Type(() => Date)
  @IsDate({ message: 'End date must be a date' })
  end_date: Date;

  @ApiProperty({ example: 5.5 })
  @IsNotEmpty({ message: 'Commission percentage is required' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Commission percentage must be a number' },
  )
  @Max(100, {
    message: 'Commission percentage must be less than or equal to 100',
  })
  commission_percentage: number;
}

export class UpdateTargetDto {
  @ApiPropertyOptional({ example: 60000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'Target amount must be a number' },
  )
  targeted_amnt?: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a date' })
  start_date?: Date;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'End date must be a date' })
  end_date?: Date;

  @ApiPropertyOptional({ example: 6.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Commission percentage must be a number' },
  )
  @Max(100, {
    message: 'Commission percentage must be less than or equal to 100',
  })
  @Min(0.0001, { message: 'Commission percentage must be greater than 0.0001' })
  commission_percentage?: number;
}

export class GetTargetDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'User id must be a number' })
  userId?: number;

  @ApiPropertyOptional({
    example: CommissionStatus.RUNNING,
    enum: CommissionStatus,
  })
  @IsOptional()
  @IsEnum(CommissionStatus, { message: 'Status is invalid' })
  status?: CommissionStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Page must be a number' })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  limit?: number;
}
