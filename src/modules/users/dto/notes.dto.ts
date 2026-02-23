import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({ message: 'Title is required' })
  @Length(3, 50, { message: 'Title must be between 3 and 50 characters' })
  title: string;

  @IsNotEmpty({ message: 'Content is required' })
  @Length(3, 1000, { message: 'Content must be between 3 and 1000 characters' })
  content: string;
}

export class UpdateNoteDto {
  @IsOptional()
  @Length(3, 50, { message: 'Title must be between 3 and 50 characters' })
  title?: string;

  @IsOptional()
  @Length(3, 1000, { message: 'Content must be between 3 and 1000 characters' })
  content?: string;
}

export class GetQueryNoteDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Page must be a number' })
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  limit: number;
}
