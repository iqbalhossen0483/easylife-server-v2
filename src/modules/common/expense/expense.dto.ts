import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ExpenseStatus } from 'src/entites/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Expense type id is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Type id must be a number' })
  type_id: number;

  @ApiProperty({ example: 5000 })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @ApiPropertyOptional({ example: 'Office rent for April' })
  @IsOptional()
  note?: string;
}

export class GetAllExpenseDto {
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

  @ApiPropertyOptional({ example: ExpenseStatus.PENDING, enum: ExpenseStatus })
  @IsOptional()
  @IsEnum(ExpenseStatus, { message: 'Status is invalid' })
  status?: ExpenseStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Type id must be a number' })
  type_id?: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  end_date?: string;
}
