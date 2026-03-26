import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class ComponentItemDto {
  @ApiProperty({ example: 2 })
  @IsNotEmpty({ message: 'Component product id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Product id must be a number' })
  product_id: number;

  @ApiProperty({ example: 'Raw Coffee Beans' })
  @IsNotEmpty({ message: 'Product name is required' })
  product_name: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  qty: number;
}

export class CreateProductionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Product id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Product id must be a number' })
  product_id: number;

  @ApiProperty({ example: 'Roasted Coffee 500g' })
  @IsNotEmpty({ message: 'Product name is required' })
  product_name: string;

  @ApiProperty({ example: 50 })
  @IsNotEmpty({ message: 'Production quantity is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Production must be a number' })
  @Min(1, { message: 'Production must be at least 1' })
  production: number;

  @ApiProperty({ type: [ComponentItemDto] })
  @IsArray({ message: 'Components must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ComponentItemDto)
  components: ComponentItemDto[];
}

export class GetAllProductionDto {
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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Product id must be a number' })
  product_id?: number;
}
