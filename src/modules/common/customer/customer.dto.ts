import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Al-Amin Store' })
  @IsNotEmpty({ message: 'Shop name is required' })
  @Length(3, 100, { message: 'Shop name must be between 3 and 100 characters' })
  shop_name: string;

  @ApiProperty({ example: 'Mirpur-10, Dhaka' })
  @IsNotEmpty({ message: 'Address is required' })
  @Length(3, 150, { message: 'Address must be between 3 and 150 characters' })
  address: string;

  @ApiProperty({ example: '01712345678' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone: string;

  @ApiPropertyOptional({ example: 'Espresso Machine' })
  @IsOptional()
  @Length(2, 50, {
    message: 'Machine type must be between 2 and 50 characters',
  })
  machine_type?: string;

  @ApiPropertyOptional({ example: 'Breville BES870' })
  @IsOptional()
  @Length(2, 50, {
    message: 'Machine model must be between 2 and 50 characters',
  })
  machine_model?: string;

  @ApiPropertyOptional({ example: 60, description: 'Commission % (1-100). Determines how much of total_sale counts toward sales targets.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Commission must be a number' })
  @Min(1, { message: 'Commission must be at least 1' })
  @Max(100, { message: 'Commission must be at most 100' })
  commission?: number;

  @IsOptional()
  profile?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Al-Amin Store Updated' })
  @IsOptional()
  @Length(3, 100, { message: 'Shop name must be between 3 and 100 characters' })
  shop_name?: string;

  @ApiPropertyOptional({ example: 'Dhanmondi-27, Dhaka' })
  @IsOptional()
  @Length(3, 150, { message: 'Address must be between 3 and 150 characters' })
  address?: string;

  @ApiPropertyOptional({ example: '01712345678' })
  @IsOptional()
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Coffee Machine' })
  @IsOptional()
  @Length(2, 50, {
    message: 'Machine type must be between 2 and 50 characters',
  })
  machine_type?: string;

  @ApiPropertyOptional({ example: 'DeLonghi EC685' })
  @IsOptional()
  @Length(2, 50, {
    message: 'Machine model must be between 2 and 50 characters',
  })
  machine_model?: string;

  @ApiPropertyOptional({ example: 7.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Commission must be a number' })
  @Min(1, { message: 'Commission must be at least 1' })
  @Max(100, { message: 'Commission must be at most 100' })
  commission?: number;

  @IsOptional()
  profile?: string;
}

export class GetAllCustomerDto {
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

  @ApiPropertyOptional({ example: 'Al-Amin' })
  @IsOptional()
  search?: string;
}
