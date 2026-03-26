import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
} from 'class-validator';
import { Designation } from 'src/entites/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 40, { message: 'Name must be between 3 and 40 characters' })
  name: string;

  @ApiProperty({ example: '123 Main Street, Dhaka' })
  @IsNotEmpty({ message: 'Address is required' })
  @Length(3, 50, { message: 'Address must be between 3 and 50 characters' })
  address: string;

  @ApiProperty({ example: '01987654321' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone: string;

  @ApiProperty({ example: 'pass123' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @ApiProperty({ example: Designation.SALES_MAN, enum: Designation })
  @IsNotEmpty({ message: 'Designation is required' })
  @IsEnum(Designation, { message: 'Designation is invalid' })
  designation: Designation;

  @ApiPropertyOptional({ example: 'profile.jpg' })
  @IsOptional()
  profile?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe Updated' })
  @IsOptional()
  @Length(3, 40, { message: 'Name must be between 3 and 40 characters' })
  name?: string;

  @ApiPropertyOptional({ example: '456 New Street, Dhaka' })
  @IsOptional()
  @Length(3, 50, { message: 'Address must be between 3 and 50 characters' })
  address?: string;

  @ApiPropertyOptional({ example: '01987654321' })
  @IsOptional()
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone?: string;

  @ApiPropertyOptional({ example: 'newpass123' })
  @IsOptional()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password?: string;

  @ApiPropertyOptional({ example: Designation.MANAGER, enum: Designation })
  @IsOptional()
  @IsEnum(Designation, { message: 'Designation is invalid' })
  designation?: Designation;

  @ApiPropertyOptional({ example: 'profile.jpg' })
  @IsOptional()
  profile?: string;
}

export class getAllUserDto {
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

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  search: string;
}
