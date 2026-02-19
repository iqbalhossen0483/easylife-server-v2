import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Designation } from 'src/entites/user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 40, { message: 'Name must be between 3 and 40 characters' })
  name: string;

  @IsNotEmpty({ message: 'Address is required' })
  @Length(3, 50, { message: 'Address must be between 3 and 50 characters' })
  address: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @IsNotEmpty({ message: 'Designation is required' })
  @IsEnum(Designation, { message: 'Designation is invalid' })
  designation: Designation;

  @IsOptional()
  profile?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @Length(3, 40, { message: 'Name must be between 3 and 40 characters' })
  name?: string;

  @IsOptional()
  @Length(3, 50, { message: 'Address must be between 3 and 50 characters' })
  address?: string;

  @IsOptional()
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone?: string;

  @IsOptional()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password?: string;

  @IsOptional()
  @IsEnum(Designation, { message: 'Designation is invalid' })
  designation?: Designation;

  @IsOptional()
  profile?: string;
}

export class getAllUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Page must be a number' })
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Limit must be a number' })
  limit: number;

  @IsOptional()
  search: string;
}

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
