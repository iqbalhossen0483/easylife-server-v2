import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '01853860483' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({ example: 'Iqbal0483' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
