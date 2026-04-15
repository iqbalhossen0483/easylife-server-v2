import { REDIS_CLIENT } from '@/configs/redis.config.module';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  async get(key: string) {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, exipre: number = 60 * 60 * 24) {
    return await this.redis.set(key, value, 'EX', exipre);
  }

  async del(key: string) {
    return await this.redis.del(key);
  }
}
