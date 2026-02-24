import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateExpenseCategoryDto {
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name: string;

  @IsOptional()
  @Length(3, 200, {
    message: 'Description must be between 3 and 200 characters',
  })
  description?: string;
}

export class UpdateExpenseCategoryDto {
  @IsOptional()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name?: string;

  @IsOptional()
  @Length(3, 200, {
    message: 'Description must be between 3 and 200 characters',
  })
  description?: string;
}

export class GetAllExpenseCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Page must be a number' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  limit?: number;

  @IsOptional()
  search?: string;
}
