import { OrderStatus } from '@/entites/order.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderProductItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Product id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Product id must be a number' })
  product_id: number;

  @ApiProperty({ example: 'Arabica Coffee Beans' })
  @IsNotEmpty({ message: 'Product name is required' })
  product_name: string;

  @ApiProperty({ example: 5 })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  qty: number;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean({ message: 'Is free must be a boolean' })
  is_free: boolean;

  @ApiProperty({ example: 500 })
  @IsNotEmpty({ message: 'Price is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  price: number;

  @ApiProperty({ example: 2500 })
  @IsNotEmpty({ message: 'Total is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total must be a number' })
  total: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Shop/Customer id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Shop id must be a number' })
  shop_id: number;

  @ApiProperty({ type: [OrderProductItemDto] })
  @IsArray({ message: 'Products must be an array' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductItemDto)
  products: OrderProductItemDto[];

  @ApiProperty({ example: 5000 })
  @IsNotEmpty({ message: 'Total sale is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total sale must be a number' })
  total_sale: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Payment must be a number' })
  payment?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Due must be a number' })
  due?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'Delivered by must be a number' },
  )
  delivered_by?: number;

  @ApiPropertyOptional({ type: [OrderProductItemDto] })
  @IsOptional()
  @IsArray({ message: 'Products must be an array' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductItemDto)
  products?: OrderProductItemDto[];

  @ApiPropertyOptional({ example: 6000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total sale must be a number' })
  total_sale?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Payment must be a number' })
  payment?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Due must be a number' })
  due?: number;
}

export class GetAllOrderDto {
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
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Shop id must be a number' })
  shop_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'User id must be a number' })
  user_id?: number;

  @ApiPropertyOptional({ example: OrderStatus.UNDELIVERED, enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Status is invalid' })
  status?: OrderStatus;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  end_date?: string;
}

export class CollectPaymentDto {
  @ApiProperty({ example: 1500 })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Discount must be a number' })
  discount?: number;

  @ApiPropertyOptional({ example: 'Partial payment received' })
  @IsOptional()
  notes?: string;
}
