import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
