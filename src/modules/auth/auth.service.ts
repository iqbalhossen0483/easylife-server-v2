import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DbListEntity } from 'src/entites/dbList.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DbListEntity)
    private readonly dbListRepo: Repository<DbListEntity>,
    private readonly JwtService: JwtService,
  ) {}

  async login(payload: LoginDto) {
    const { db, password, phone } = payload;

    // check database;
    const database = await this.dbListRepo.findOne({ where: { id: db } });
    if (!database) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
