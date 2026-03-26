import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'EasyLife Business' })
  @IsOptional()
  @Length(3, 50, { message: 'Title must be between 3 and 50 characters' })
  title?: string;

  @ApiPropertyOptional({ example: 'ELB' })
  @IsOptional()
  @Length(2, 15, { message: 'Short title must be between 2 and 15 characters' })
  short_title?: string;

  @ApiPropertyOptional({ example: '01853860483' })
  @IsOptional()
  @Length(11, 11, { message: 'Phone number must be 11 characters' })
  phone?: string;

  @ApiPropertyOptional({ example: '01700000000' })
  @IsOptional()
  @Length(11, 11, { message: 'Alternate phone must be 11 characters' })
  alt_phone?: string;

  @ApiPropertyOptional({ example: '123 Main Street, Dhaka' })
  @IsOptional()
  @Length(3, 100, { message: 'Address must be between 3 and 100 characters' })
  address?: string;

  @ApiPropertyOptional({ example: 'Iqbal Hossen' })
  @IsOptional()
  @Length(3, 40, { message: 'Owner name must be between 3 and 40 characters' })
  owner_name?: string;
}
