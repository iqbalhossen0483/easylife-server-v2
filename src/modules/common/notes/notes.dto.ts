import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: 'Meeting Notes' })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(3, 50, { message: 'Title must be between 3 and 50 characters' })
  title: string;

  @ApiProperty({ example: 'Discussed Q2 targets and commission structure updates' })
  @IsNotEmpty({ message: 'Content is required' })
  @Length(3, 1000, { message: 'Content must be between 3 and 1000 characters' })
  content: string;
}

export class UpdateNoteDto {
  @ApiPropertyOptional({ example: 'Updated Meeting Notes' })
  @IsOptional()
  @Length(3, 50, { message: 'Title must be between 3 and 50 characters' })
  title?: string;

  @ApiPropertyOptional({ example: 'Added action items from the planning session' })
  @IsOptional()
  @Length(3, 1000, { message: 'Content must be between 3 and 1000 characters' })
  content?: string;
}

export class GetQueryNoteDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Page must be a number' })
  page: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  limit: number;
}
