import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Global Coffee Traders' })
  @IsNotEmpty({ message: 'Supplier name is required' })
  @Length(3, 100, { message: 'Name must be between 3 and 100 characters' })
  name: string;

  @ApiProperty({ example: '01812345678' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone: string;

  @ApiPropertyOptional({ example: 'Gulshan-2, Dhaka' })
  @IsOptional()
  @Length(3, 150, { message: 'Address must be between 3 and 150 characters' })
  address?: string;

  @IsOptional()
  profile?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional({ example: 'Global Coffee Traders Ltd' })
  @IsOptional()
  @Length(3, 100, { message: 'Name must be between 3 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ example: '01812345678' })
  @IsOptional()
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Banani, Dhaka' })
  @IsOptional()
  @Length(3, 150, { message: 'Address must be between 3 and 150 characters' })
  address?: string;

  @IsOptional()
  profile?: string;
}

export class GetAllSupplierDto {
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

  @ApiPropertyOptional({ example: 'Global' })
  @IsOptional()
  search?: string;
}
