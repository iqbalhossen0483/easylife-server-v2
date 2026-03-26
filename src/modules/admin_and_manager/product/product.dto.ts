import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Arabica Coffee Beans' })
  @IsNotEmpty({ message: 'Product name is required' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'ACB' })
  @IsOptional()
  @Length(1, 50, { message: 'Short name must be between 1 and 50 characters' })
  short_name?: string;

  @ApiPropertyOptional({ example: 'Raw Material' })
  @IsOptional()
  @Length(2, 50, { message: 'Type must be between 2 and 50 characters' })
  type?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Sort order must be a number' })
  sl?: number;

  @IsOptional()
  profile?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Arabica Coffee Beans Premium' })
  @IsOptional()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'ACBP' })
  @IsOptional()
  @Length(1, 50, { message: 'Short name must be between 1 and 50 characters' })
  short_name?: string;

  @ApiPropertyOptional({ example: 'Finished Goods' })
  @IsOptional()
  @Length(2, 50, { message: 'Type must be between 2 and 50 characters' })
  type?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Sort order must be a number' })
  sl?: number;

  @IsOptional()
  profile?: string;
}

export class GetAllProductDto {
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

  @ApiPropertyOptional({ example: 'Coffee' })
  @IsOptional()
  search?: string;
}
