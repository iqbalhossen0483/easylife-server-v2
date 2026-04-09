import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

export class PurchaseProductItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Product id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Product id must be a number' })
  product_id: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  qty: number;

  @ApiProperty({ example: 200 })
  @IsNotEmpty({ message: 'Price is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  price: number;

  @ApiProperty({ example: 20000 })
  @IsNotEmpty({ message: 'Total is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Total must be a number' })
  total: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Supplier id is required' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'Supplier id must be a number' },
  )
  supplier_id: number;

  @ApiProperty({ type: [PurchaseProductItemDto] })
  @IsArray({ message: 'Products must be an array' })
  @ValidateNested({ each: true })
  @Transform(({ value }: { value: string }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as PurchaseProductItemDto[];
        return plainToInstance(PurchaseProductItemDto, parsed);
      } catch (error) {
        return plainToInstance(PurchaseProductItemDto, value);
      }
    }
    return plainToInstance(PurchaseProductItemDto, value);
  })
  @Type(() => PurchaseProductItemDto)
  products: PurchaseProductItemDto[];

  @ApiProperty({ example: 20000 })
  @IsNotEmpty({ message: 'Total amount is required' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Total amount must be a number' },
  )
  total_amount: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Payment must be a number' })
  payment?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Discount must be a number' })
  discount?: number;

  @ApiPropertyOptional({ example: 'Bank transfer' })
  @IsOptional()
  payment_info?: string;
}

export class PaySupplierDto {
  @ApiProperty({ example: 5000 })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @ApiPropertyOptional({ example: 'Remaining balance paid' })
  @IsOptional()
  notes?: string;
}

export class GetAllPurchaseDto {
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
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'Supplier id must be a number' },
  )
  supplier_id?: number;
}
