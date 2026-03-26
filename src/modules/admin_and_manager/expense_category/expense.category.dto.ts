import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Office Supplies' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'Expenses for office supplies and stationery',
  })
  @IsOptional()
  @Length(3, 200, {
    message: 'Description must be between 3 and 200 characters',
  })
  description?: string;
}

export class UpdateExpenseCategoryDto {
  @ApiPropertyOptional({ example: 'Office Supplies Updated' })
  @IsOptional()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description for office supplies' })
  @IsOptional()
  @Length(3, 200, {
    message: 'Description must be between 3 and 200 characters',
  })
  description?: string;
}

export class GetAllExpenseCategoryDto {
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

  @ApiPropertyOptional({ example: 'Office' })
  @IsOptional()
  search?: string;
}
