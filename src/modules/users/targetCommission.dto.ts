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
import { CommissionStatus } from 'src/entites/UserCommissionTarget.entity';

export class CreateUserCommissionTargetDto {
  @IsNotEmpty({ message: 'User id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'User id must be a number' })
  userId: number;

  @IsNotEmpty({ message: 'Target amount is required' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'Target amount must be a number' },
  )
  targetedAmnt: number;

  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a date' })
  startDate: Date;

  @IsNotEmpty({ message: 'End date is required' })
  @Type(() => Date)
  @IsDate({ message: 'End date must be a date' })
  endDate: Date;

  @IsNotEmpty({ message: 'Commission percentage is required' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'Commission percentage must be a number' },
  )
  @Max(100, {
    message: 'Commission percentage must be less than or equal to 100',
  })
  commissionPercentage: number;
}

export class UpdateUserCommissionTargetDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'Target amount must be a number' },
  )
  targetedAmnt?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a date' })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'End date must be a date' })
  endDate?: Date;

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
  commissionPercentage?: number;
}

export class GetUserCommissionTargetDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'User id must be a number' })
  userId?: number;

  @IsOptional()
  @IsEnum(CommissionStatus, { message: 'Status is invalid' })
  status?: CommissionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Page must be a number' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  limit?: number;
}
