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
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 40, { message: 'Name must be between 3 and 40 characters' })
  name: string;

  @IsNotEmpty({ message: 'Address is required' })
  @Length(3, 50, { message: 'Address must be between 3 and 50 characters' })
  address: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @IsNotEmpty({ message: 'Designation is required' })
  @IsEnum(Designation, { message: 'Designation is invalid' })
  designation: Designation;

  @IsOptional()
  profile?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @Length(3, 40, { message: 'Name must be between 3 and 40 characters' })
  name?: string;

  @IsOptional()
  @Length(3, 50, { message: 'Address must be between 3 and 50 characters' })
  address?: string;

  @IsOptional()
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone?: string;

  @IsOptional()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password?: string;

  @IsOptional()
  @IsEnum(Designation, { message: 'Designation is invalid' })
  designation?: Designation;

  @IsOptional()
  profile?: string;
}

export class getAllUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Page must be a number' })
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Limit must be a number' })
  limit: number;

  @IsOptional()
  search: string;
}
