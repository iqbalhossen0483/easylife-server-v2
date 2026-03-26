import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Designation } from 'src/entites/user.entity';

export class SendNotificationDto {
  @ApiProperty({ example: 'New Update Available' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ example: 'Please check the latest updates in your dashboard' })
  @IsNotEmpty({ message: 'Body is required' })
  body: string;

  @ApiPropertyOptional({ example: [Designation.SALES_MAN], enum: Designation, isArray: true })
  @IsOptional()
  @IsArray({ message: 'Target roles must be an array' })
  @IsEnum(Designation, { each: true, message: 'Invalid role' })
  target_roles?: Designation[];

  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @IsArray({ message: 'User ids must be an array' })
  @Type(() => Number)
  user_ids?: number[];

  @ApiPropertyOptional({ example: { screen: 'dashboard' } })
  @IsOptional()
  data?: Record<string, unknown>;
}
