import { ProductType } from '@/entites/product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Arabica Coffee Beans' })
  @IsNotEmpty({ message: 'Product name is required' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name!: string;

  @ApiPropertyOptional({ example: 'ACB' })
  @IsOptional()
  @Length(1, 50, { message: 'Short name must be between 1 and 50 characters' })
  short_name?: string;

  @ApiPropertyOptional({ example: ProductType.MAIN_PRODUCT })
  @IsOptional()
  @IsEnum(ProductType, { message: 'Invalid product type' })
  type?: ProductType;

  @ApiProperty({ example: 100 })
  @IsNotEmpty({ message: 'Price is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  price!: number;

  @ApiProperty({ example: 50 })
  @IsNotEmpty({ message: 'Cost is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cost must be a number' })
  cost!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Sort order must be a number' })
  sl?: number;

  @IsOptional()
  image?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Arabica Coffee Beans Premium' })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'ACBP' })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Short name must be between 1 and 50 characters' })
  short_name?: string;

  @ApiPropertyOptional({ example: ProductType.MAIN_PRODUCT })
  @IsOptional()
  @IsEnum(ProductType, { message: 'Invalid product type' })
  type?: ProductType;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  price?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cost must be a number' })
  cost?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Sort order must be a number' })
  sl?: number;

  @IsOptional()
  image?: string;
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
